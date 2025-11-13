const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Coupon = require('./../../models/couponModel');

// @desc    Validator for creating coupon
exports.createCouponValidator = [
  check('name')
    .notEmpty()
    .withMessage('Coupon name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Coupon name must be between 3 and 50 characters')
    .custom(async (value) => {
      const coupon = await Coupon.findOne({ name: value.toUpperCase() });
      if (coupon) {
        throw new Error('Coupon name already exists');
      }
      return true;
    }),

  check('expire')
    .notEmpty()
    .withMessage('Expiration date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const expireDate = new Date(value);
      const now = new Date();
      if (expireDate <= now) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    }),

  check('discountType')
    .optional()
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be either "percentage" or "fixed"'),

  check('discount')
    .notEmpty()
    .withMessage('Discount value is required')
    .isNumeric()
    .withMessage('Discount must be a number')
    .custom((value, { req }) => {
      const discountType = req.body.discountType || 'percentage';
      
      if (discountType === 'percentage') {
        if (value < 1 || value > 100) {
          throw new Error('Percentage discount must be between 1 and 100');
        }
      } else {
        if (value <= 0) {
          throw new Error('Fixed amount discount must be greater than 0');
        }
      }
      return true;
    }),

  check('maxUses')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max uses must be a positive integer'),

  check('minOrderAmount')
    .optional()
    .isNumeric()
    .withMessage('Minimum order amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be 0 or greater'),

  check('maxDiscountAmount')
    .optional()
    .isNumeric()
    .withMessage('Maximum discount amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Maximum discount amount must be greater than 0')
    .custom((value, { req }) => {
      const discountType = req.body.discountType || 'percentage';
      if (discountType === 'fixed' && value) {
        throw new Error('Maximum discount amount is only applicable for percentage discounts');
      }
      return true;
    }),

  validatorMiddleware,
];

// @desc    Validator for getting coupon by ID
exports.getCouponValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid coupon ID format'),
  validatorMiddleware,
];

// @desc    Validator for updating coupon
exports.updateCouponValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid coupon ID format'),

  check('name')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Coupon name must be between 3 and 50 characters')
    .custom(async (value, { req }) => {
      const coupon = await Coupon.findOne({
        name: value.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (coupon) {
        throw new Error('Coupon name already exists');
      }
      return true;
    }),

  check('expire')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const expireDate = new Date(value);
      const now = new Date();
      if (expireDate <= now) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    }),

  check('discountType')
    .optional()
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be either "percentage" or "fixed"'),

  check('discount')
    .optional()
    .isNumeric()
    .withMessage('Discount must be a number')
    .custom((value, { req }) => {
      const discountType = req.body.discountType || 'percentage';
      
      if (discountType === 'percentage') {
        if (value < 1 || value > 100) {
          throw new Error('Percentage discount must be between 1 and 100');
        }
      } else {
        if (value <= 0) {
          throw new Error('Fixed amount discount must be greater than 0');
        }
      }
      return true;
    }),

  check('maxUses')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max uses must be a positive integer'),

  check('minOrderAmount')
    .optional()
    .isNumeric()
    .withMessage('Minimum order amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be 0 or greater'),

  check('maxDiscountAmount')
    .optional()
    .isNumeric()
    .withMessage('Maximum discount amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Maximum discount amount must be greater than 0')
    .custom((value, { req }) => {
      const discountType = req.body.discountType || 'percentage';
      if (discountType === 'fixed' && value) {
        throw new Error('Maximum discount amount is only applicable for percentage discounts');
      }
      return true;
    }),

  check('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  validatorMiddleware,
];

// @desc    Validator for deleting coupon
exports.deleteCouponValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid coupon ID format'),
  validatorMiddleware,
];

// @desc    Validator for validating/applying coupon
exports.validateApplyCouponValidator = [
  body('couponName')
    .notEmpty()
    .withMessage('Coupon name is required')
    .isString()
    .withMessage('Coupon name must be a string'),

  body('totalAmount')
    .notEmpty()
    .withMessage('Total amount is required')
    .isNumeric()
    .withMessage('Total amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be greater than or equal to 0'),

  validatorMiddleware,
];

// @desc    Validator for applying coupon with ID
exports.applyCouponWithIdValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid coupon ID format'),

  body('totalAmount')
    .notEmpty()
    .withMessage('Total amount is required')
    .isNumeric()
    .withMessage('Total amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be greater than or equal to 0'),

  validatorMiddleware,
];

// @desc    Validator for toggling coupon active status
exports.toggleCouponActiveValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid coupon ID format'),
  validatorMiddleware,
];

// @desc    Validator for pagination queries
exports.paginationValidator = [
  check('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  check('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  validatorMiddleware,
];