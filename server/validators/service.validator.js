const { body } = require('express-validator');

const createServiceRules = () => [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Service title is required')
        .isLength({ max: 200 })
        .withMessage('Title must be at most 200 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ max: 5000 })
        .withMessage('Description must be at most 5000 characters'),
    body('basePrice')
        .notEmpty()
        .withMessage('Base price is required')
        .isFloat({ min: 0 })
        .withMessage('Base price must be a positive number'),
    body('deliveryTime')
        .trim()
        .notEmpty()
        .withMessage('Delivery time is required')
        .isLength({ max: 100 })
        .withMessage('Delivery time must be at most 100 characters')
];

const updateServiceRules = () => [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 200 }),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty').isLength({ max: 5000 }),
    body('basePrice').optional().isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
    body('deliveryTime').optional().trim().notEmpty().isLength({ max: 100 })
];

module.exports = { createServiceRules, updateServiceRules };
