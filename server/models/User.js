const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [8, 'Password must be at least 8 characters']
    },
    role: {
        type: String,
        enum: ['customer', 'vendor', 'admin'],
        default: 'customer'
    },
    avatar: {
        type: String,
        default: null
    },
    vendorProfile: {
        storeName: { type: String, trim: true },
        bio: { type: String },
        profileImage: { type: String },
        socialLinks: {
            instagram: { type: String },
            twitter: { type: String },
            portfolio: { type: String },
            linkedin: { type: String }
        }
    },
    vendorStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending' // New vendors require admin approval per Annexure
    },
    addresses: [{
        label: { type: String, default: 'Home' },
        street: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        phone: { type: String },
        isDefault: { type: Boolean, default: false }
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationOtp: String,
    emailVerificationOtpExpire: Date
}, {
    timestamps: true
});

// Encrypt password using bcrypt (Mongoose 9: no next() - use async/await only)
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

userSchema.methods.getEmailVerificationOtp = function () {
    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
    this.emailVerificationOtp = otp;
    this.emailVerificationOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return otp;
};

module.exports = mongoose.model('User', userSchema);
