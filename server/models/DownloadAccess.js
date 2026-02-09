const mongoose = require('mongoose');

/**
 * DownloadAccess Model - Secure, controlled access to digital downloads
 * Annexure-A: Secure, controlled access to digital downloads
 */
const downloadAccessSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    maxDownloads: {
        type: Number,
        default: null
    },
    lastDownloadAt: { type: Date },
    expiresAt: { type: Date },
    isRevoked: {
        type: Boolean,
        default: false
    },
    revokedAt: { type: Date },
    revokedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

downloadAccessSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });
downloadAccessSchema.index({ expiresAt: 1 });
downloadAccessSchema.index({ isRevoked: 1 });

module.exports = mongoose.model('DownloadAccess', downloadAccessSchema);
