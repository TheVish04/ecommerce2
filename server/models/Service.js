const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a service title']
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
        type: String, // e.g. "3-5 days"
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
