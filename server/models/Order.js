const mongoose = require('mongoose');

/**
 * Order Model - Unified cart/checkout for physical, digital, and service-based orders
 * Annexure-A: Support for physical, digital, and service-based orders
 */
const orderItemSchema = new mongoose.Schema({
    itemType: {
        type: String,
        enum: ['product', 'service'],
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    unitPrice: {
        type: Number,
        required: true
    },
    options: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    scheduledDate: {
        type: Date,
        sparse: true
    },
    customizations: {
        type: String,
        sparse: true
    }
}, { _id: true });

const orderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lineItems: [orderItemSchema],
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        options: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    }],
    shippingAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        phone: { type: String }
    },
    totalAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String }
}, {
    timestamps: true
});

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'products.product': 1 });

module.exports = mongoose.model('Order', orderSchema);
