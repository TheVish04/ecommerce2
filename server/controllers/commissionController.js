const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Commission = require('../models/Commission');
const User = require('../models/User');
const Service = require('../models/Service');
const { sendCommissionPaymentEmail } = require('../utils/email');

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
}

const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE || '10');

// @desc    Create a new commission request
// @route   POST /api/commissions
// @access  Private
const createCommission = asyncHandler(async (req, res) => {
    const { serviceId, description, budget, deadline, referenceImages } = req.body;

    if (!serviceId || !description || !budget || !deadline) {
        res.status(400);
        throw new Error('Please fill in all fields');
    }

    const service = await Service.findById(serviceId);
    if (!service) {
        res.status(404);
        throw new Error('Service not found');
    }

    const commission = await Commission.create({
        service: serviceId,
        customer: req.user.id,
        vendor: service.vendor,
        description,
        budget,
        deadline,
        referenceImages: referenceImages || [],
        status: 'pending'
    });

    res.status(201).json(commission);
});

// @desc    Get user commissions (as customer or vendor)
// @route   GET /api/commissions
// @access  Private
const getCommissions = asyncHandler(async (req, res) => {
    const { role } = req.query;

    let query = {};
    if (role === 'vendor') {
        query = { vendor: req.user.id };
    } else if (role === 'customer') {
        query = { customer: req.user.id };
    } else {
        query = {
            $or: [{ customer: req.user.id }, { vendor: req.user.id }]
        };
    }

    const commissions = await Commission.find(query)
        .populate('customer', 'name email avatarUrl')
        .populate('vendor', 'name email vendorProfile')
        .populate('service', 'title price deliveryTime basePrice')
        .sort('-createdAt');

    res.json(commissions);
});

// @desc    Update commission status
// @route   PUT /api/commissions/:id/status
// @access  Private (Vendor only mostly, but maybe client can cancel?)
const updateCommissionStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const commission = await Commission.findById(req.params.id);

    if (!commission) {
        res.status(404);
        throw new Error('Commission not found');
    }

    // Verify ownership
    if (commission.vendor.toString() !== req.user.id && commission.customer.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    // Vendor transitions
    if (commission.vendor.toString() === req.user.id) {
        if (['accepted', 'rejected', 'in_progress', 'completed', 'delivered'].includes(status)) {
            if (status === 'in_progress' && commission.status === 'accepted') {
                if (commission.paymentStatus !== 'paid') {
                    res.status(400);
                    throw new Error('Customer must pay before work can start. Payment is held in escrow until delivery.');
                }
            }
            commission.status = status;
        }
    }

    // Customer transitions (e.g. cancel)
    if (commission.customer.toString() === req.user.id) {
        if (status === 'cancelled' && commission.status === 'pending') {
            commission.status = status;
        }
    }

    const updatedCommission = await commission.save();
    res.json(updatedCommission);
});

// @desc    Upload delivery files
// @route   PUT /api/commissions/:id/delivery
// @access  Private (Vendor only)
const uploadDelivery = asyncHandler(async (req, res) => {
    const { deliveryFiles } = req.body; // Array of { url, name }
    const commission = await Commission.findById(req.params.id);

    if (!commission) {
        res.status(404);
        throw new Error('Commission not found');
    }

    if (commission.vendor.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized as vendor');
    }

    if (deliveryFiles && deliveryFiles.length > 0) {
        commission.deliveryFiles = [...commission.deliveryFiles, ...deliveryFiles];
        commission.status = 'delivered'; // Auto update status? Prompt says "Upload delivery files... Mark Completed". Let's just upload for now, user can mark delivered manually or we do it here. 
        // Let's set it to 'delivered' as a convenience or just add files.
        // Prompt sequence: "Upload delivery files (Cloudinary) -> Mark Completed".
        // It's safer to just add files. Status change can be separate or implicit.
        // Let's leave status change to the manual "Update Status" or implied here.
        // I'll update status to 'delivered' if files are added, it makes sense.
        commission.status = 'delivered';
    }

    const updatedCommission = await commission.save();
    res.json(updatedCommission);
});

// @desc    Initiate commission payment (Razorpay) - customer pays when vendor has accepted
// @route   POST /api/commissions/:id/initiate-payment
// @access  Private (Customer only)
const initiateCommissionPayment = asyncHandler(async (req, res) => {
    if (!razorpayInstance) {
        res.status(503);
        throw new Error('Payment gateway is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env');
    }

    const commission = await Commission.findById(req.params.id)
        .populate('service', 'title basePrice')
        .populate('vendor', 'name email')
        .populate('customer', 'name email');

    if (!commission) {
        res.status(404);
        throw new Error('Commission not found');
    }

    if (commission.customer.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Only the customer can pay for this commission');
    }

    if (commission.status !== 'accepted') {
        res.status(400);
        throw new Error('Commission must be accepted by the vendor before payment');
    }

    if (commission.paymentStatus === 'paid') {
        res.status(400);
        throw new Error('Commission is already paid');
    }

    const amountInPaise = Math.round(commission.budget * 100);
    if (amountInPaise < 100) {
        res.status(400);
        throw new Error('Minimum payment amount is ₹1');
    }

    const razorpayOrder = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `commission_${commission._id}_${Date.now()}`,
        notes: {
            commissionId: commission._id.toString(),
            customerId: commission.customer._id.toString()
        }
    });

    commission.razorpayOrderId = razorpayOrder.id;
    await commission.save();

    res.json({
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID,
        commissionId: commission._id
    });
});

// @desc    Verify commission payment and mark as paid (escrow)
// @route   POST /api/commissions/:id/verify-payment
// @access  Private (Customer only)
const verifyCommissionPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400);
        throw new Error('Invalid payment verification data');
    }

    const commission = await Commission.findById(req.params.id)
        .populate('service', 'title basePrice')
        .populate('vendor', 'name email')
        .populate('customer', 'name email');

    if (!commission) {
        res.status(404);
        throw new Error('Commission not found');
    }

    if (commission.customer.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Only the customer can verify payment for this commission');
    }

    if (commission.paymentStatus === 'paid') {
        return res.json(commission);
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

    const platformFee = Math.round(commission.budget * (COMMISSION_RATE / 100) * 100) / 100;
    const vendorAmount = Math.round((commission.budget - platformFee) * 100) / 100;

    commission.paymentStatus = 'paid';
    commission.paidAt = new Date();
    commission.razorpayOrderId = razorpay_order_id;
    commission.razorpayPaymentId = razorpay_payment_id;
    commission.commissionRate = COMMISSION_RATE;
    commission.platformFee = platformFee;
    commission.vendorAmount = vendorAmount;
    await commission.save();

    try {
        await sendCommissionPaymentEmail(commission);
    } catch (e) {
        console.error('Commission payment email failed:', e.message);
    }

    const updated = await Commission.findById(commission._id)
        .populate('customer', 'name email')
        .populate('vendor', 'name email vendorProfile')
        .populate('service', 'title basePrice deliveryTime');

    res.json(updated);
});

module.exports = {
    createCommission,
    getCommissions,
    updateCommissionStatus,
    uploadDelivery,
    initiateCommissionPayment,
    verifyCommissionPayment
};
