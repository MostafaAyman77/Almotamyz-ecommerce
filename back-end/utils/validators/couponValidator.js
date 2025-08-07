const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.getCouponValidator = [
    check('id').isMongoId().withMessage('Invalid Coupon id format'),
    validatorMiddleware,
];

exports.createCouponValidator = [
    check('name')
        .notEmpty()
        .withMessage('Coupon name is required')
        .isLength({ min: 2 })
        .withMessage('Too short coupon name')
        .isLength({ max: 32 })
        .withMessage('Too long coupon name'),

    check('expire')
        .notEmpty()
        .withMessage('Coupon expire date is required')
        .isISO8601()
        .withMessage('Invalid date format')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('Expire date must be in the future');
            }
            return true;
        }),

    check('discount')
        .notEmpty()
        .withMessage('Coupon discount is required')
        .isFloat({ min: 1, max: 100 })
        .withMessage('Discount must be between 1 and 100'),

    check('maxUses')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Max uses must be a positive integer'),

    check('minOrderAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum order amount must be a positive number'),

    check('maxDiscountAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum discount amount must be a positive number'),

    validatorMiddleware,
];

exports.updateCouponValidator = [
    check('id').isMongoId().withMessage('Invalid Coupon id format'),
    
    check('name')
        .optional()
        .isLength({ min: 2 })
        .withMessage('Too short coupon name')
        .isLength({ max: 32 })
        .withMessage('Too long coupon name'),

    check('expire')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('Expire date must be in the future');
            }
            return true;
        }),

    check('discount')
        .optional()
        .isFloat({ min: 1, max: 100 })
        .withMessage('Discount must be between 1 and 100'),

    check('maxUses')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Max uses must be a positive integer'),

    check('minOrderAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum order amount must be a positive number'),

    check('maxDiscountAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum discount amount must be a positive number'),

    validatorMiddleware,
];

exports.deleteCouponValidator = [
    check('id').isMongoId().withMessage('Invalid Coupon id format'),
    validatorMiddleware,
];

exports.validateCouponValidator = [
    check('couponName')
        .notEmpty()
        .withMessage('Coupon name is required'),
    
    check('orderAmount')
        .notEmpty()
        .withMessage('Order amount is required')
        .isFloat({ min: 0 })
        .withMessage('Order amount must be a positive number'),

    validatorMiddleware,
];

