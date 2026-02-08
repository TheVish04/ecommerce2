const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
    registerRules,
    loginRules,
    forgotPasswordRules,
    resetPasswordRules
} = require('../validators/auth.validator');

router.post('/register', registerRules(), validate, registerUser);
router.post('/login', loginRules(), validate, loginUser);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPasswordRules(), validate, forgotPassword);
router.put('/resetpassword/:resettoken', resetPasswordRules(), validate, resetPassword);

module.exports = router;
