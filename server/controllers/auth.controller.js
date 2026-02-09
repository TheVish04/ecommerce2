const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
// const PendingRegistration = require('../models/PendingRegistration'); // Deprecated
const generateToken = require('../utils/generateToken');
const {
    sendPasswordResetEmail,
    sendVerificationOtpEmail,
    verifyConnection
} = require('../utils/email');

// @desc    Test SMTP Connection
// @route   GET /api/auth/test-email
// @access  Public
const testEmailConnection = asyncHandler(async (req, res) => {
    const result = await verifyConnection();
    if (result.success) {
        res.status(200).json(result);
    } else {
        res.status(500).json(result);
    }
});

// @desc    Register new user (Direct creation, No OTP)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const emailLower = email.toLowerCase();

    // Check if user exists
    const userExists = await User.findOne({ email: emailLower });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user immediately (Bypass email verification)
    const user = await User.create({
        name,
        email: emailLower,
        password,
        role: role || 'customer',
        vendorStatus: role === 'vendor' ? 'pending' : undefined,
        isEmailVerified: true // Explicitly true
    });

    res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorStatus: user.vendorStatus,
        token: generateToken(user._id),
    });
});

// @desc    Verify email with OTP (Deprecated - Auto verified)
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmailOtp = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Email verification is disabled. You can login directly.' });
});

// @desc    Resend verification OTP (Deprecated)
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Email verification is disabled.' });
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
    /*
    if (user.isEmailVerified === false) {
        return res.status(200).json({
            needsVerification: true,
            email: user.email,
            message: 'Please verify your email to continue'
        });
    }
    */

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
    resendOtp,
    testEmailConnection
};
