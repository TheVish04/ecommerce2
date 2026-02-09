const { body } = require('express-validator');

const createCategoryRules = () => [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ max: 100 })
        .withMessage('Name must be at most 100 characters'),
    body('type')
        .notEmpty()
        .withMessage('Category type is required')
        .isIn(['product', 'service'])
        .withMessage('Type must be product or service'),
    body('slug').optional().trim().isLength({ max: 100 }),
    body('parent').optional().isMongoId().withMessage('Invalid parent category ID'),
    body('description').optional().trim().isLength({ max: 500 }),
    body('sortOrder').optional().isInt({ min: 0 })
];

const updateCategoryRules = () => [
    body('name').optional().trim().notEmpty().isLength({ max: 100 }),
    body('slug').optional().trim().isLength({ max: 100 }),
    body('type').optional().isIn(['product', 'service']),
    body('parent').optional().isMongoId().withMessage('Invalid parent category ID'),
    body('description').optional().trim().isLength({ max: 500 }),
    body('sortOrder').optional().isInt({ min: 0 }),
    body('isActive').optional().isBoolean()
];

module.exports = {
    createCategoryRules,
    updateCategoryRules
};
