const mongoose = require('mongoose');

/**
 * Commission Model - Customized & commission-based art, lifecycle management
 * Annexure-A: Commission lifecycle management, escrow, admin oversight
 */
const commissionSchema = new mongoose.Schema({
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed'],
        default: 'pending'
    },
    description: {
        type: String,
        required: true
    },
    referenceImages: [{
        type: String
    }],
    budget: {
        type: Number,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    deliveryFiles: [{
        url: String,
        name: String,
        submittedAt: { type: Date, default: Date.now }
    }],
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'released', 'refunded'],
        default: 'pending'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paidAt: { type: Date },
    escrowReleaseAt: { type: Date },
    commissionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    platformFee: {
        type: Number,
        default: 0
    },
    vendorAmount: {
        type: Number,
        default: 0
    },
    adminNotes: {
        type: String,
        sparse: true
    },
    disputedAt: { type: Date },
    disputeReason: { type: String },
    resolvedAt: { type: Date },
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

commissionSchema.index({ customer: 1, createdAt: -1 });
commissionSchema.index({ vendor: 1, createdAt: -1 });
commissionSchema.index({ status: 1 });
commissionSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Commission', commissionSchema);
