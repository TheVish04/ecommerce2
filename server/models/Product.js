const mongoose = require('mongoose');

/**
 * Product Model - ArtCommerce (E-Commerce vertical)
 * Annexure-A: Physical Art, Art-Based Merchandise, Digital Art Products
 */
const productSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a product title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price in INR'],
        min: [0, 'Price must be positive']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    categorySlug: {
        type: String,
        sparse: true
    },
    subCategory: {
        type: String,
        sparse: true
    },
    productType: {
        type: String,
        enum: ['physical_art', 'merchandise', 'digital'],
        sparse: true
    },
    physicalArtType: {
        type: String,
        enum: ['original_artwork', 'prints_reproductions', 'handcrafted', 'miniature', 'tribal_traditional', 'art_books', 'stationery', 'other'],
        sparse: true
    },
    merchandiseType: {
        type: String,
        enum: ['apparel', 'accessories', 'home_decor', 'stationery', 'other'],
        sparse: true
    },
    digitalType: {
        type: String,
        enum: ['illustration', 'photo_texture', 'wallpaper', 'template', 'font_icon_brush', 'nft', 'other'],
        sparse: true
    },
    style: { type: String, sparse: true },
    gender: {
        type: String,
        enum: ['Men', 'Women', 'Unisex', 'Kids'],
        sparse: true
    },
    availableSizes: [{ type: String }],
    availableColors: [{ type: String }],
    printLocations: [{
        type: String,
        enum: ['Front', 'Back', 'Both']
    }],
    material: { type: String, sparse: true },
    designType: {
        type: String,
        enum: ['Printed', 'Embroidered'],
        sparse: true
    },
    type: {
        type: String,
        enum: ['physical', 'digital'],
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    downloadUrl: { type: String },
    downloadLimit: {
        type: Number,
        default: null
    },
    downloadExpiryDays: {
        type: Number,
        default: null
    },
    isLimitedEdition: {
        type: Boolean,
        default: false
    },
    editionNumber: {
        type: Number,
        sparse: true
    },
    totalEditionSize: {
        type: Number,
        sparse: true
    },
    isSigned: {
        type: Boolean,
        default: false
    },
    certification: {
        type: String,
        sparse: true
    },
    stock: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'sold_out'],
        default: 'active'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sales: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

productSchema.index({ vendor: 1, status: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ productType: 1, type: 1 });
productSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
