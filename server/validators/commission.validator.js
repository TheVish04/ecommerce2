const { body } = require('express-validator');

const createCommissionRules = () => [
    body('serviceId')
        .notEmpty()
        .withMessage('Service is required')
        .isMongoId()
        .withMessage('Invalid service ID'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ max: 2000 })
        .withMessage('Description must be at most 2000 characters'),
    body('budget')
        .notEmpty()
        .withMessage('Budget is required')
        .isFloat({ min: 0 })
        .withMessage('Budget must be a positive number'),
    body('deadline')
        .notEmpty()
        .withMessage('Deadline is required')
        .isISO8601()
        .withMessage('Deadline must be a valid date'),
    body('referenceImages').optional().isArray(),
    body('referenceImages.*').optional().trim().isURL().withMessage('Reference image must be a valid URL')
];

const updateCommissionStatusRules = () => [
    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['accepted', 'rejected', 'in_progress', 'completed', 'delivered', 'cancelled'])
        .withMessage('Invalid status')
];

const uploadDeliveryRules = () => [
    body('deliveryFiles')
        .optional()
        .isArray()
        .withMessage('deliveryFiles must be an array'),
    body('deliveryFiles.*.url').optional().trim().isURL().withMessage('Delivery file URL must be valid'),
    body('deliveryFiles.*.name').optional().trim().isLength({ max: 255 })
];

module.exports = {
    createCommissionRules,
    updateCommissionStatusRules,
    uploadDeliveryRules
};
