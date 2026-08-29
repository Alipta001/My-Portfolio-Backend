const { body, validationResult } = require('express-validator');

const contactValidation = [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters'),
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('message').trim().isLength({ min: 10, max: 5000 }).withMessage('Message must be 10-5000 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: errors.array(),
      });
    }
    next();
  },
];

module.exports = { contactValidation };
