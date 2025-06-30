const { body, validationResult } = require('express-validator');

const validateProduct = [
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['t-shirt','trousers','shirts','formal-pants','jeans-pants','Accessory'])
    .withMessage('Invalid category'),
  
 
  body('size')
    .notEmpty().withMessage('Size is required')
    .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Universal'])
    .withMessage('Invalid size'),
  
 
  body('color')
    .optional()
    .isLength({ max: 30 }).withMessage('Color too long'),
  
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  
  body('purchasePrice')
    .notEmpty().withMessage('Purchase price is required')
    .isFloat({ min: 0.01 }).withMessage('Invalid purchase price'),
  
  body('sellingPrice')
    .notEmpty().withMessage('Selling price is required')
    .isFloat({ min: 0.01 }).withMessage('Invalid selling price'),
  
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