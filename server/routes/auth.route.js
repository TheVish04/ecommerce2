const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword,
    verifyEmailOtp,
    resendOtp
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
    registerRules,
    loginRules,
    forgotPasswordRules,
    resetPasswordRules,
    verifyEmailRules,
    resendOtpRules
} = require('../validators/auth.validator');

router.post('/register', ...registerRules(), validate, registerUser);
router.post('/verify-email', ...verifyEmailRules(), validate, verifyEmailOtp);
router.post('/resend-otp', ...resendOtpRules(), validate, resendOtp);
router.post('/login', ...loginRules(), validate, loginUser);
router.get('/me', protect, getMe);
router.post('/forgotpassword', ...forgotPasswordRules(), validate, forgotPassword);
router.put('/resetpassword/:resettoken', ...resetPasswordRules(), validate, resetPassword);

module.exports = router;
