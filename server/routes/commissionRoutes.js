const express = require('express');
const router = express.Router();
const {
    createCommission,
    getCommissions,
    updateCommissionStatus,
    uploadDelivery
} = require('../controllers/commissionController');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
    createCommissionRules,
    updateCommissionStatusRules,
    uploadDeliveryRules
} = require('../validators/commission.validator');

router.route('/')
    .post(protect, createCommissionRules(), validate, createCommission)
    .get(protect, getCommissions);

router.route('/:id/status')
    .put(protect, updateCommissionStatusRules(), validate, updateCommissionStatus);

router.route('/:id/delivery')
    .put(protect, uploadDeliveryRules(), validate, uploadDelivery);

module.exports = router;
