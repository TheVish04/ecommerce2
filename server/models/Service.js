const mongoose = require('mongoose');

/**
 * Service Model - Creative Services vertical
 * Annexure-A: Commission-based, Pre-order Professional Services, Educational (Pre-Booking)
 */
const serviceSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a service title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    basePrice: {
        type: Number,
        required: [true, 'Please add a base price in INR'],
        min: [0, 'Price must be positive']
    },
    coverImage: {
        type: String,
        required: true
    },
    deliveryTime: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    categorySlug: { type: String, sparse: true },
    serviceType: {
        type: String,
        enum: ['commission', 'pre_order', 'educational'],
        default: 'commission'
    },
    commissionSubType: {
        type: String,
        enum: ['portrait', 'sculpture', 'mural', 'calligraphy', 'illustration', 'religious', 'other'],
        sparse: true
    },
    preOrderSubType: {
        type: String,
        enum: ['logo_branding', 'illustration', 'book_cover', 'exhibition_design', 'curation', 'consultancy', 'other'],
        sparse: true
    },
    educationalSubType: {
        type: String,
        enum: ['workshop', 'certificate_course', 'masterclass', 'portfolio_review', 'mentoring', 'other'],
        sparse: true
    },
    isPreBooking: {
        type: Boolean,
        default: false
    },
    maxParticipants: {
        type: Number,
        sparse: true
    },
    scheduledStartDate: {
        type: Date,
        sparse: true
    },
    scheduledEndDate: {
        type: Date,
        sparse: true
    },
    location: {
        type: String,
        sparse: true
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

serviceSchema.index({ vendor: 1 });
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ serviceType: 1 });

module.exports = mongoose.model('Service', serviceSchema);
