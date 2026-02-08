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

module.exports = { validate };
