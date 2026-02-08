const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a product title']
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
        type: String,
        required: [true, 'Please select a category']
    },
    subCategory: {
        type: String,
        sparse: true
    },
    style: {
        type: String,
        sparse: true
    },
    gender: {
        type: String,
        enum: ['Men', 'Women', 'Unisex', 'Kids'],
        sparse: true
    },
    availableSizes: [{
        type: String
    }],
    availableColors: [{
        type: String
    }],
    printLocations: [{
        type: String,
        enum: ['Front', 'Back', 'Both']
    }],
    material: {
        type: String,
        sparse: true
    },
    designType: {
        type: String,
        enum: ['Printed', 'Embroidered'],
        sparse: true
    },
    type: {
        type: String,
        enum: ['physical', 'digital', 'service'],
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    downloadUrl: {
        type: String
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

module.exports = mongoose.model('Product', productSchema);
