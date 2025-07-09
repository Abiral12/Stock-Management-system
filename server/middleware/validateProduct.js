const { body, validationResult } = require('express-validator');

const validateProduct = [
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['clothing', 'accessories'])
    .withMessage('Invalid category'),

  body('subcategory')
    .notEmpty().withMessage('Subcategory is required')
    .custom((value, { req }) => {
      const category = req.body.category;
      if (category === 'clothing') {
        return ['t-shirt', 'trousers', 'shirts', 'formal-pants', 'jeans-pants'].includes(value);
      } else if (category === 'accessories') {
        return ['belt', 'purse', 'wallet', 'watch', 'hat'].includes(value);
      }
      return false;
    }).withMessage('Invalid subcategory for the selected category'),

 body('size')
  .if((value, { req }) => req.body.category === 'clothing')
  .notEmpty().withMessage('Size is required for clothing items').bail()
  .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL']).withMessage('Invalid size'),

  body('color')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Color too long'),

  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 0 }).withMessage('Quantity cannot be negative'),

  body('purchasePrice')
    .notEmpty().withMessage('Purchase price is required')
    .isFloat({ min: 0 }).withMessage('Purchase price cannot be negative'),

  body('sellingPrice')
    .notEmpty().withMessage('Selling price is required')
    .isFloat({ min: 0 }).withMessage('Selling price cannot be negative'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array().map(err => err.msg) 
      });
    }
    next();
  }
];

module.exports = validateProduct;