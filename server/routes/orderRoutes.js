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
const { runValidation } = require('../middleware/validate.middleware');
const { createOrderRules, updateOrderStatusRules, verifyPaymentRules } = require('../validators/order.validator');

router.use(protect);

router.route('/')
    .post(runValidation(createOrderRules()), createOrder)
    .get(getMyOrders);

router.post('/initiate-payment', runValidation(createOrderRules()), initiatePayment);
router.post('/verify-payment', runValidation(verifyPaymentRules()), verifyPayment);

router.get('/:orderId/download/:productId', getDownloadUrl);
router.get('/:id/invoice', getInvoice);
router.patch('/:id', runValidation(updateOrderStatusRules()), updateOrderStatus);
router.get('/:id', getOrderById);

module.exports = router;
