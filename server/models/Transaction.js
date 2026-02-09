const mongoose = require('mongoose');

/**
 * Transaction Model - Vendor payouts, commission releases
 * Annexure-A: Vendor order and commission handling, payout tracking
 */
const transactionSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['payout', 'commission_release', 'refund', 'adjustment'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    referenceType: {
        type: String,
        enum: ['order', 'commission', 'booking'],
        sparse: true
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        sparse: true
    },
    razorpayPayoutId: String,
    razorpayTransferId: String,
    bankAccountId: String,
    description: {
        type: String
    },
    adminNotes: {
        type: String
    },
    completedAt: { type: Date },
    failedAt: { type: Date },
    failureReason: { type: String }
}, {
    timestamps: true
});

transactionSchema.index({ vendor: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ referenceType: 1, referenceId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
