const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Service = require('../models/Service');
const { sendOrderConfirmationEmail } = require('../utils/email');

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
}

async function calculateOrderTotal(items) {
    let totalAmount = 0;
    for (const item of items) {
        const { productId, serviceId, quantity = 1 } = item;
        if (productId) {
            const product = await Product.findById(productId);
            if (!product || !product.isActive || product.status !== 'active') {
                throw new Error(`Product "${product?.title || 'Unknown'}" is not available`);
            }
            if (product.type === 'physical' && product.stock < quantity) {
                throw new Error(`Insufficient stock for "${product.title}"`);
            }
            totalAmount += product.price * quantity;
        } else if (serviceId) {
            const service = await Service.findById(serviceId);
            if (!service || !service.isActive) {
                throw new Error(`Service is not available`);
            }
            totalAmount += service.basePrice * quantity;
        } else {
            throw new Error('Invalid cart item: productId or serviceId required');
        }
    }
    return totalAmount;
}

// @desc    Initiate payment - create Razorpay order
// @route   POST /api/orders/initiate-payment
// @access  Private
const initiatePayment = asyncHandler(async (req, res) => {
    if (!razorpayInstance) {
        res.status(503);
        throw new Error('Payment gateway is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env');
    }

    const { items, shippingAddress } = req.body;
    const buyerId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400);
        throw new Error('Cart is empty');
    }

    const totalAmount = await calculateOrderTotal(items);
    const amountInPaise = Math.round(totalAmount * 100);
    if (amountInPaise < 100) {
        res.status(400);
        throw new Error('Minimum order amount is ₹1');
    }

    const razorpayOrder = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: { buyerId }
    });

    res.json({
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID
    });
});

// @desc    Verify payment and create order
// @route   POST /api/orders/verify-payment
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, shippingAddress } = req.body;
    const buyerId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !items?.length) {
        res.status(400);
        throw new Error('Invalid payment verification data');
    }

    if (razorpayInstance) {
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');
        if (expectedSignature !== razorpay_signature) {
            res.status(400);
            throw new Error('Payment verification failed');
        }
    }

    const { buildOrderFromItems } = require('./orderController');
    const order = await buildOrderFromItems(items, buyerId, shippingAddress || {});
    order.paymentStatus = razorpayInstance ? 'paid' : 'pending';
    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    const populatedOrder = await Order.findById(order._id)
        .populate('products.product', 'title price images type vendor')
        .populate('lineItems.product', 'title price images type')
        .populate('lineItems.service', 'title basePrice deliveryTime')
        .populate('buyer', 'name email');

    try {
        await sendOrderConfirmationEmail(populatedOrder);
    } catch (e) {
        console.error('Order confirmation email failed:', e.message);
    }

    res.status(201).json(populatedOrder);
});

module.exports = { initiatePayment, verifyPayment };
