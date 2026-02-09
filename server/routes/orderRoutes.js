const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrderById,
    getInvoice,
    getDownloadUrl,
    updateOrderStatus
} = require('../controllers/orderController');
const { initiatePayment, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createOrderRules, updateOrderStatusRules, verifyPaymentRules } = require('../validators/order.validator');

router.use(protect);

router.route('/')
    .post(...createOrderRules(), validate, createOrder)
    .get(getMyOrders);

router.post('/initiate-payment', ...createOrderRules(), validate, initiatePayment);
router.post('/verify-payment', ...verifyPaymentRules(), validate, verifyPayment);

router.get('/:orderId/download/:productId', getDownloadUrl);
router.get('/:id/invoice', getInvoice);
router.patch('/:id', ...updateOrderStatusRules(), validate, updateOrderStatus);
router.get('/:id', getOrderById);

module.exports = router;
