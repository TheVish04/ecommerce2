const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderConfirmationEmail } = require('../utils/email');

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
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

    let totalAmount = 0;
    for (const item of items) {
        const { productId, quantity } = item;
        if (!productId || !quantity || quantity < 1) {
            res.status(400);
            throw new Error('Invalid cart item');
        }
        const product = await Product.findById(productId);
        if (!product || !product.isActive || product.status !== 'active') {
            res.status(400);
            throw new Error(`Product not available`);
        }
        if (product.type === 'physical' && product.stock < quantity) {
            res.status(400);
            throw new Error(`Insufficient stock for "${product.title}"`);
        }
        totalAmount += product.price * quantity;
    }

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

    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
        const { productId, quantity, options = {} } = item;
        const product = await Product.findById(productId);
        if (!product || !product.isActive || product.status !== 'active') {
            res.status(400);
            throw new Error(`Product "${product?.title || 'Unknown'}" is not available`);
        }
        if (product.type === 'physical' && product.stock < quantity) {
            res.status(400);
            throw new Error(`Insufficient stock for "${product.title}"`);
        }
        totalAmount += product.price * quantity;
        orderItems.push({ product: productId, quantity, options });
    }

    const order = await Order.create({
        buyer: buyerId,
        products: orderItems,
        totalAmount,
        shippingAddress: shippingAddress || {},
        status: 'pending',
        paymentStatus: razorpayInstance ? 'paid' : 'pending',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
    });

    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (product && product.type === 'physical') {
            product.stock -= item.quantity;
            product.sales = (product.sales || 0) + item.quantity;
            if (product.stock <= 0) product.status = 'sold_out';
            await product.save();
        }
    }

    const populatedOrder = await Order.findById(order._id)
        .populate('products.product', 'title price images type vendor')
        .populate('buyer', 'name email');

    try {
        await sendOrderConfirmationEmail(populatedOrder);
    } catch (e) {
        console.error('Order confirmation email failed:', e.message);
    }

    res.status(201).json(populatedOrder);
});

module.exports = { initiatePayment, verifyPayment };
