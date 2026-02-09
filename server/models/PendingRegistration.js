const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const pendingRegistrationSchema = mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
    vendorStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    emailVerificationOtp: String,
    emailVerificationOtpExpire: Date
}, { timestamps: true });

pendingRegistrationSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

pendingRegistrationSchema.methods.getEmailVerificationOtp = function () {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    this.emailVerificationOtp = otp;
    this.emailVerificationOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return otp;
};

module.exports = mongoose.model('PendingRegistration', pendingRegistrationSchema);
