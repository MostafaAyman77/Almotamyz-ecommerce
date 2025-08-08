const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.addProductToWishlistValidator = [
    check('productId')
        .isMongoId()
        .withMessage('Invalid Product id format'),
    validatorMiddleware,
];

exports.removeProductFromWishlistValidator = [
    check('productId')
        .isMongoId()
        .withMessage('Invalid Product id format'),
    validatorMiddleware,
];

exports.checkProductInWishlistValidator = [
    check('productId')
        .isMongoId()
        .withMessage('Invalid Product id format'),
    validatorMiddleware,
];

exports.moveProductToCartValidator = [
    check('productId')
        .isMongoId()
        .withMessage('Invalid Product id format'),
    
    check('color')
        .optional()
        .isString()
        .withMessage('Color must be a string'),
    
    validatorMiddleware,
];

