const { body, validationResult } = require('express-validator');

const customerRegisterRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('name is required')
    .isLength({ max: 120 })
    .withMessage('name must be at most 120 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('email must be valid')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 characters'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('email must be valid')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('password is required'),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array({ onlyFirstError: true }),
      },
    });
  }
  next();
}

module.exports = {
  customerRegisterRules,
  loginRules,
  handleValidationErrors,
};
