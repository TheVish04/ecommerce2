const mongoose = require('mongoose');

/**
 * Booking Model - Educational art products (pre-booking)
 * Annexure-A: Offline workshops, certificate courses, masterclasses, portfolio review
 */
const bookingSchema = new mongoose.Schema({
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
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    scheduledDate: {
        type: Date,
        required: true
    },
    participantCount: {
        type: Number,
        default: 1
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ vendor: 1, scheduledDate: 1 });
bookingSchema.index({ service: 1, scheduledDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
