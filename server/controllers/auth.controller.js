const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendPasswordResetEmail, sendVerificationOtpEmail } = require('../utils/email');

// @desc    Register new user (sends OTP for email verification)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser?.isEmailVerified) {
        res.status(400);
        throw new Error('User already exists');
    }

    const userRole = role || 'customer';
    let user;

    if (existingUser && !existingUser.isEmailVerified) {
        // Re-registration: update unverified user and resend OTP
        existingUser.name = name;
        existingUser.password = password;
        existingUser.role = userRole;
        if (userRole === 'vendor') {
            existingUser.vendorStatus = 'pending';
        }
        await existingUser.save();
        user = existingUser;
    } else {
        const userData = {
            name,
            email,
            password,
            role: userRole,
            isEmailVerified: false
        };
        if (userRole === 'vendor') {
            userData.vendorStatus = 'pending';
        }
        user = await User.create(userData);
        if (!user) {
            res.status(400);
            throw new Error('Invalid user data');
        }
    }

    const otp = user.getEmailVerificationOtp();
    await user.save({ validateBeforeSave: false });

    try {
        await sendVerificationOtpEmail(user, otp);
    } catch (err) {
        await User.findByIdAndDelete(user._id);
        res.status(500);
        throw new Error('Failed to send verification email');
    }

    res.status(201).json({
        needsVerification: true,
        email: user.email,
        message: 'Verification OTP sent to your email'
    });
});

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmailOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        res.status(400);
        throw new Error('Email and OTP are required');
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
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

    if (user.emailVerificationOtp !== String(otp).trim()) {
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

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
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
        throw new Error('Failed to send verification email');
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
