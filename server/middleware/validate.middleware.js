const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const firstError = errors.array({ onlyFirstError: true })[0];
    const message = firstError?.msg || 'Validation failed';
    res.status(400);
    const err = new Error(message);
    next(err);
};

/**
 * Wrapper to run validation rules - avoids passing arrays to Express router
 * which can cause "next is not a function" in Express 5
 */
const runValidation = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map((v) => v.run(req)));
        const errors = validationResult(req);
        if (errors.isEmpty()) return next();

        const firstError = errors.array({ onlyFirstError: true })[0];
        res.status(400).json({ message: firstError?.msg || 'Validation failed' });
    };
};

module.exports = { validate, runValidation };
