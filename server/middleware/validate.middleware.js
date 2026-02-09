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

        const allErrors = errors.array({ onlyFirstError: false });
        const firstError = allErrors[0];

        // Return richer information so frontend can see WHICH field failed
        // instead of a generic "Invalid value"
        res.status(400).json({
            message: firstError?.msg || 'Validation failed',
            field: firstError?.param,
            errors: allErrors
        });
    };
};

module.exports = { validate, runValidation };
