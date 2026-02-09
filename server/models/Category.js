const mongoose = require('mongoose');

/**
 * Category Model - Hierarchical categories for Products and Services
 * Supports Annexure-A: Physical Art, Merchandise, Digital, Creative Services, Educational
 */
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        maxlength: 100
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['product', 'service'],
        required: [true, 'Category type (product|service) is required']
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    icon: {
        type: String
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

categorySchema.index({ type: 1, isActive: 1 });
categorySchema.index({ parent: 1 });
// slug index omitted: unique: true on slug field already creates it

// Virtual for children
categorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent'
});

module.exports = mongoose.model('Category', categorySchema);
