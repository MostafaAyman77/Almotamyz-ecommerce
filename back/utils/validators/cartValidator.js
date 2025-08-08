const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.addProductToCartValidator = [
    check('productId')
        .isMongoId()
        .withMessage('Invalid Product id format'),
    validatorMiddleware,
];

exports.removeCartItemValidator = [
    check('itemId').isMongoId().withMessage('Invalid cart item id format'),
    validatorMiddleware,
];

exports.updateCartItemQuantityValidator = [
    check('itemId').isMongoId().withMessage('Invalid cart item id format'),
    check('quantity')
        .isNumeric()
        .withMessage('Quantity must be a number')
        .custom((val) => {
            if (val <= 0) {
                throw new Error('Quantity must be greater than 0');
            }
            return true;
        }),
    validatorMiddleware,
];

