const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword,
    verifyEmailOtp,
    resendOtp,
    testEmailConnection
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { runValidation } = require('../middleware/validate.middleware');
const {
    registerRules,
    loginRules,
    forgotPasswordRules,
    resetPasswordRules,
    verifyEmailRules,
    resendOtpRules
} = require('../validators/auth.validator');

router.post('/register', runValidation(registerRules()), registerUser);
router.post('/verify-email', runValidation(verifyEmailRules()), verifyEmailOtp);
router.post('/resend-otp', runValidation(resendOtpRules()), resendOtp);
router.post('/login', runValidation(loginRules()), loginUser);
router.get('/me', protect, getMe);
router.get('/test-email', testEmailConnection); // Health check for SMTP
router.post('/forgotpassword', runValidation(forgotPasswordRules()), forgotPassword);
router.put('/resetpassword/:resettoken', runValidation(resetPasswordRules()), resetPassword);

module.exports = router;
