const { body } = require('express-validator');

const createOrderRules = () => [
    body('items')
        .isArray({ min: 1 }).withMessage('Cart must have at least one item'),
    body('items.*.productId').notEmpty().withMessage('Product ID is required').isMongoId().withMessage('Invalid product ID'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.options').optional().isObject(),
    body('shippingAddress').optional().isObject(),
    body('shippingAddress.street').optional().trim().isLength({ max: 200 }),
    body('shippingAddress.city').optional().trim().isLength({ max: 100 }),
    body('shippingAddress.state').optional().trim().isLength({ max: 100 }),
    body('shippingAddress.pincode').optional().trim().isLength({ max: 20 }),
    body('shippingAddress.phone').optional().trim().isLength({ max: 20 })
];

const updateOrderStatusRules = () => [
    body('status')
        .isIn(['pending', 'processing', 'shipped', 'completed', 'cancelled'])
        .withMessage('Invalid status')
];

const verifyPaymentRules = () => [
    body('razorpay_order_id').notEmpty().withMessage('Order ID required'),
    body('razorpay_payment_id').notEmpty().withMessage('Payment ID required'),
    body('razorpay_signature').notEmpty().withMessage('Signature required'),
    body('items').isArray({ min: 1 }).withMessage('Items required'),
    body('items.*.productId').notEmpty().isMongoId(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('items.*.options').optional().isObject(),
    body('shippingAddress').optional().isObject()
];

module.exports = { createOrderRules, updateOrderStatusRules, verifyPaymentRules };
