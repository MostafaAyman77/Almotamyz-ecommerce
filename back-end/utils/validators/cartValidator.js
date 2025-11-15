const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.addProductToCartValidator = [
  check('productId')
    .isMongoId()
    .withMessage('Invalid Product id format'),
  check('color')
    .optional()
    .isString()
    .withMessage('Color must be a string'),
  check('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  validatorMiddleware,
];

exports.removeCartItemValidator = [
  check('itemId')
    .isMongoId()
    .withMessage('Invalid cart item id format'),
  validatorMiddleware,
];

exports.updateCartItemQuantityValidator = [
  check('itemId')
    .isMongoId()
    .withMessage('Invalid cart item id format'),
  check('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  validatorMiddleware,
];