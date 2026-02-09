const { body } = require('express-validator');

const updateProfileRules = () => [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 100 }).withMessage('Name too long')
];

const addAddressRules = () => [
    body('street').trim().notEmpty().withMessage('Street is required').isLength({ max: 200 }).withMessage('Street too long'),
    body('city').trim().notEmpty().withMessage('City is required').isLength({ max: 100 }).withMessage('City too long'),
    body('state').optional().trim().isLength({ max: 100 }),
    body('pincode').optional().trim().isLength({ max: 20 }),
    body('phone').trim().notEmpty().withMessage('Phone is required').isLength({ max: 20 }).withMessage('Phone too long'),
    body('label').optional().trim().isLength({ max: 50 }),
    body('isDefault').optional().isBoolean()
];

const updateAddressRules = () => [
    body('street').optional().trim().notEmpty().withMessage('Street cannot be empty').isLength({ max: 200 }),
    body('city').optional().trim().notEmpty().withMessage('City cannot be empty').isLength({ max: 100 }),
    body('state').optional().trim().isLength({ max: 100 }),
    body('pincode').optional().trim().isLength({ max: 20 }),
    body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty').isLength({ max: 20 }),
    body('label').optional().trim().isLength({ max: 50 }),
    body('isDefault').optional().isBoolean()
];

module.exports = {
    updateProfileRules,
    addAddressRules,
    updateAddressRules
};
