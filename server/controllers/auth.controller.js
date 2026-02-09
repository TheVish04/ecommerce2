const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const PendingRegistration = require('../models/PendingRegistration');
const generateToken = require('../utils/generateToken');
const { sendPasswordResetEmail, sendVerificationOtpEmail } = require('../utils/email');

// @desc    Register new user (sends OTP for email verification; user is NOT stored until OTP verified)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const emailLower = email.toLowerCase();

    // Already a verified user? Reject.
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser?.isEmailVerified) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Must have email configured before creating any record (prevents hanging + clear error)
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        res.status(503);
        throw new Error('Email service is not configured. OTP cannot be sent. Please set SMTP_HOST and SMTP_USER in server .env');
    }

    const userRole = role || 'customer';
    let pending = await PendingRegistration.findOne({ email: emailLower });

    if (pending) {
        pending.name = name;
        pending.password = password;
        pending.role = userRole;
        pending.vendorStatus = userRole === 'vendor' ? 'pending' : undefined;
        await pending.save();
    } else {
        pending = await PendingRegistration.create({
            name,
            email: emailLower,
            password,
            role: userRole,
            vendorStatus: userRole === 'vendor' ? 'pending' : 'pending'
        });
    }

    const otp = pending.getEmailVerificationOtp();
    await pending.save({ validateBeforeSave: false });

    try {
        await sendVerificationOtpEmail({ name: pending.name, email: pending.email }, otp);
    } catch (err) {
        await PendingRegistration.findByIdAndDelete(pending._id);
        res.status(500);
        throw new Error(err.message || 'Failed to send verification email. Check SMTP settings and try again.');
    }

    res.status(201).json({
        needsVerification: true,
        email: pending.email,
        message: 'Verification OTP sent to your email'
    });
});

// @desc    Verify email with OTP (creates User only after successful verification)
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmailOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        res.status(400);
        throw new Error('Email and OTP are required');
    }

    const emailLower = email.toLowerCase();
    const otpTrimmed = String(otp).trim();

    // 1. Check PendingRegistration first (new flow: user not stored until verify)
    const pending = await PendingRegistration.findOne({ email: emailLower });

    if (pending) {
        if (!pending.emailVerificationOtp || !pending.emailVerificationOtpExpire) {
            res.status(400);
            throw new Error('OTP expired. Please request a new one.');
        }
        if (pending.emailVerificationOtpExpire < Date.now()) {
            await PendingRegistration.findByIdAndUpdate(pending._id, {
                $unset: { emailVerificationOtp: 1, emailVerificationOtpExpire: 1 }
            });
            res.status(400);
            throw new Error('OTP expired. Please request a new one.');
        }
        if (pending.emailVerificationOtp !== otpTrimmed) {
            res.status(400);
            throw new Error('Invalid OTP');
        }

        // Create User only after OTP verified
        const user = await User.create({
            name: pending.name,
            email: pending.email,
            password: pending.password,
            role: pending.role,
            vendorStatus: pending.vendorStatus || (pending.role === 'vendor' ? 'pending' : undefined),
            isEmailVerified: true
        });
        await PendingRegistration.findByIdAndDelete(pending._id);

        return res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            vendorStatus: user.vendorStatus,
            token: generateToken(user._id)
        });
    }

    // 2. Legacy: unverified User already in DB (e.g. from before this change)
    const user = await User.findOne({ email: emailLower });
    if (!user) {
        res.status(404);
        throw new Error('User not found. Please sign up again and verify with the OTP sent to your email.');
    }
    if (user.isEmailVerified) {
        res.status(400);
        throw new Error('Email is already verified');
    }
    if (!user.emailVerificationOtp || !user.emailVerificationOtpExpire) {
        res.status(400);
        throw new Error('OTP expired. Please request a new one.');
    }
    if (user.emailVerificationOtpExpire < Date.now()) {
        user.emailVerificationOtp = undefined;
        user.emailVerificationOtpExpire = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(400);
        throw new Error('OTP expired. Please request a new one.');
    }
    if (user.emailVerificationOtp !== otpTrimmed) {
        res.status(400);
        throw new Error('Invalid OTP');
    }

    user.isEmailVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorStatus: user.vendorStatus,
        token: generateToken(user._id)
    });
});

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }

    const emailLower = email.toLowerCase();

    // Prefer PendingRegistration (new flow)
    const pending = await PendingRegistration.findOne({ email: emailLower });
    if (pending) {
        const otp = pending.getEmailVerificationOtp();
        await pending.save({ validateBeforeSave: false });
        try {
            await sendVerificationOtpEmail({ name: pending.name, email: pending.email }, otp);
        } catch (err) {
            res.status(500);
            throw new Error(err.message || 'Failed to send verification email');
        }
        return res.json({ success: true, message: 'New OTP sent to your email' });
    }

    // Legacy: unverified User in DB
    const user = await User.findOne({ email: emailLower });
    if (!user) {
        res.status(404);
        throw new Error('User not found. Please sign up first.');
    }
    if (user.isEmailVerified) {
        res.status(400);
        throw new Error('Email is already verified');
    }

    const otp = user.getEmailVerificationOtp();
    await user.save({ validateBeforeSave: false });

    try {
        await sendVerificationOtpEmail(user, otp);
    } catch (err) {
        res.status(500);
        throw new Error(err.message || 'Failed to send verification email');
    }

    res.json({ success: true, message: 'New OTP sent to your email' });
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    // Block only if explicitly unverified (new signups); legacy users without field can login
    if (user.isEmailVerified === false) {
        return res.status(200).json({
            needsVerification: true,
            email: user.email,
            message: 'Please verify your email to continue'
        });
    }

    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorStatus: user.vendorStatus,
        token: generateToken(user._id),
    });
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    try {
        await sendPasswordResetEmail(user, resetToken);
        res.status(200).json({ success: true, message: 'Password reset email sent' });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500);
        throw new Error('Email could not be sent');
    }
});

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid token');
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        data: 'Password reset success',
        token: generateToken(user._id) // Log them in immediately
    });
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword,
    verifyEmailOtp,
    resendOtp
};
