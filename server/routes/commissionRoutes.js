const express = require('express');
const router = express.Router();
const {
    createCommission,
    getCommissions,
    updateCommissionStatus,
    uploadDelivery,
    initiateCommissionPayment,
    verifyCommissionPayment
} = require('../controllers/commissionController');
const { protect } = require('../middleware/auth.middleware');
const { runValidation } = require('../middleware/validate.middleware');
const {
    createCommissionRules,
    updateCommissionStatusRules,
    uploadDeliveryRules,
    verifyCommissionPaymentRules
} = require('../validators/commission.validator');

router.route('/')
    .post(protect, runValidation(createCommissionRules()), createCommission)
    .get(protect, getCommissions);

router.post('/:id/initiate-payment', protect, initiateCommissionPayment);
router.post('/:id/verify-payment', protect, runValidation(verifyCommissionPaymentRules()), verifyCommissionPayment);

router.route('/:id/status')
    .put(protect, runValidation(updateCommissionStatusRules()), updateCommissionStatus);

router.route('/:id/delivery')
    .put(protect, runValidation(uploadDeliveryRules()), uploadDelivery);

module.exports = router;
