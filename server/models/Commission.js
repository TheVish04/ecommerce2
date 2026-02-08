const mongoose = require('mongoose');

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
        enum: ['pending', 'accepted', 'rejected', 'in_progress', 'delivered', 'completed', 'cancelled'],
        default: 'pending'
    },
    description: {
        type: String,
        required: true
    },
    referenceImages: [{
        type: String // URL from Cloudinary
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
        enum: ['pending', 'paid', 'released'],
        default: 'pending'
    },
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

module.exports = mongoose.model('Commission', commissionSchema);
