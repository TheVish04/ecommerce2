const { body } = require('express-validator');

const createProductRules = () => [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Product title is required')
        .isLength({ max: 200 })
        .withMessage('Title must be at most 200 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ max: 5000 })
        .withMessage('Description must be at most 5000 characters'),
    body('price')
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('category')
        .notEmpty()
        .withMessage('Category is required')
        .custom((val) => {
            const str = String(val).trim();
            if (!str) throw new Error('Category is required');
            if (/^[a-fA-F0-9]{24}$/.test(str)) return true;
            if (str.length <= 100) return true;
            throw new Error('Invalid category');
        }),
    body('type')
        .notEmpty()
        .withMessage('Product type is required')
        .isIn(['physical', 'digital', 'service'])
        .withMessage('Type must be physical, digital, or service'),
    body('subCategory').optional().trim().isLength({ max: 100 }),
    body('style').optional().trim().isLength({ max: 100 }),
    body('gender').optional().isIn(['Men', 'Women', 'Unisex', 'Kids']),
    body('material').optional().trim().isLength({ max: 100 }),
    body('designType').optional().isIn(['Printed', 'Embroidered']),
    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer'),
    body('downloadUrl').optional().trim().isURL().withMessage('Download URL must be valid'),
    body('availableSizes').optional().isArray(),
    body('availableSizes.*').optional().trim().isLength({ max: 20 }),
    body('availableColors').optional().isArray(),
    body('availableColors.*').optional().trim().isLength({ max: 50 }),
    body('printLocations').optional().isArray(),
    body('printLocations.*').optional().isIn(['Front', 'Back', 'Both']),
    body('existingImages').optional()
];

const updateProductRules = () => [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 200 }),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty').isLength({ max: 5000 }),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').optional().custom((val) => !val || /^[a-fA-F0-9]{24}$/.test(String(val)) || String(val).length <= 100),
    body('subCategory').optional().trim().isLength({ max: 100 }),
    body('type').optional().isIn(['physical', 'digital', 'service']),
    body('style').optional().trim().isLength({ max: 100 }),
    body('gender').optional().isIn(['Men', 'Women', 'Unisex', 'Kids']),
    body('material').optional().trim().isLength({ max: 100 }),
    body('designType').optional().isIn(['Printed', 'Embroidered']),
    body('stock').optional().isInt({ min: 0 }),
    body('status').optional().isIn(['draft', 'active', 'sold_out']),
    body('isActive').optional().isBoolean(),
    body('downloadUrl').optional().trim().isURL(),
    body('availableSizes').optional().isArray(),
    body('availableSizes.*').optional().trim().isLength({ max: 20 }),
    body('availableColors').optional().isArray(),
    body('availableColors.*').optional().trim().isLength({ max: 50 }),
    body('printLocations').optional().isArray(),
    body('printLocations.*').optional().isIn(['Front', 'Back', 'Both']),
    body('existingImages').optional()
];

module.exports = { createProductRules, updateProductRules };
