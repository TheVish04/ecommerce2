const { body } = require('express-validator');

// Gmail only: allows user@gmail.com, user.name@gmail.com, user+tag@gmail.com
const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

// Strong password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char (@$!%*?&)
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const registerRules = () => [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
    body('email')
        .trim().notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email')
        .matches(GMAIL_REGEX).withMessage('Only Gmail addresses are allowed')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .matches(STRONG_PASSWORD_REGEX)
        .withMessage('Password must be 8+ chars with uppercase, lowercase, number & special char (@$!%*?&)'),
    body('role').optional().isIn(['customer', 'vendor']).withMessage('Invalid role')
];

const loginRules = () => [
    body('email')
        .trim().notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email')
        .matches(GMAIL_REGEX).withMessage('Only Gmail addresses are allowed')
        .normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordRules = () => [
    body('email')
        .trim().notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email')
        .matches(GMAIL_REGEX).withMessage('Only Gmail addresses are allowed')
        .normalizeEmail()
];

const resetPasswordRules = () => [
    body('password')
        .notEmpty().withMessage('Password is required')
        .matches(STRONG_PASSWORD_REGEX)
        .withMessage('Password must be 8+ chars with uppercase, lowercase, number & special char (@$!%*?&)')
];

const verifyEmailRules = () => [
    body('email')
        .trim().notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email')
        .matches(GMAIL_REGEX).withMessage('Only Gmail addresses are allowed')
        .normalizeEmail(),
    body('otp')
        .custom((val) => /^\d{6}$/.test(String(val || '').trim()))
        .withMessage('OTP must be 6 digits')
];

const resendOtpRules = () => [
    body('email')
        .trim().notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email')
        .matches(GMAIL_REGEX).withMessage('Only Gmail addresses are allowed')
        .normalizeEmail()
];

module.exports = {
    registerRules,
    loginRules,
    forgotPasswordRules,
    resetPasswordRules,
    verifyEmailRules,
    resendOtpRules
};
