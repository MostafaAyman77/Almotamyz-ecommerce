const { check, param } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Coupon = require('./../../models/couponModel');
const db = require('./../../services/DB/db.services.js');

exports.getCouponValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Coupon id format')
    .custom(async (val, { req }) => {
      const coupon = await db.findOne({
        model: Coupon,
        filter: { _id: val }
      });
      
      if (!coupon) {
        throw new Error('Coupon not found');
      }
      return true;
    }),
  validatorMiddleware,
];

exports.createCouponValidator = [
  check('name')
    .notEmpty()
    .withMessage('Coupon name is required')
    .isLength({ min: 2 })
    .withMessage('Too short coupon name')
    .isLength({ max: 32 })
    .withMessage('Too long coupon name')
    .custom(async (val, { req }) => {
      const existingCoupon = await db.findOne({
        model: Coupon,
        filter: { name: val.toUpperCase() }
      });
      
      if (existingCoupon) {
        throw new Error('Coupon with this name already exists');
      }
      return true;
    }),

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

  check('applicableProducts')
    .optional()
    .isArray()
    .withMessage('Applicable products must be an array'),

  check('applicableProducts.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID format'),

  check('applicableCategories')
    .optional()
    .isArray()
    .withMessage('Applicable categories must be an array'),

  check('applicableCategories.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID format'),

  validatorMiddleware,
];

exports.updateCouponValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Coupon id format')
    .custom(async (val, { req }) => {
      const coupon = await db.findOne({
        model: Coupon,
        filter: { _id: val }
      });
      
      if (!coupon) {
        throw new Error('Coupon not found');
      }
      return true;
    }),
  
  check('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Too short coupon name')
    .isLength({ max: 32 })
    .withMessage('Too long coupon name')
    .custom(async (val, { req }) => {
      const existingCoupon = await db.findOne({
        model: Coupon,
        filter: { name: val.toUpperCase(), _id: { $ne: req.params.id } }
      });
      
      if (existingCoupon) {
        throw new Error('Coupon with this name already exists');
      }
      return true;
    }),

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

  check('applicableProducts')
    .optional()
    .isArray()
    .withMessage('Applicable products must be an array'),

  check('applicableProducts.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID format'),

  check('applicableCategories')
    .optional()
    .isArray()
    .withMessage('Applicable categories must be an array'),

  check('applicableCategories.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID format'),

  validatorMiddleware,
];

exports.deleteCouponValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Coupon id format')
    .custom(async (val, { req }) => {
      const coupon = await db.findOne({
        model: Coupon,
        filter: { _id: val }
      });
      
      if (!coupon) {
        throw new Error('Coupon not found');
      }
      return true;
    }),
  validatorMiddleware,
];

exports.validateCouponValidator = [
  check('couponName')
    .notEmpty()
    .withMessage('Coupon name is required')
    .isLength({ min: 2 })
    .withMessage('Invalid coupon name'),
  
  check('orderAmount')
    .notEmpty()
    .withMessage('Order amount is required')
    .isFloat({ min: 0 })
    .withMessage('Order amount must be a positive number'),

  check('productIds')
    .optional()
    .isArray()
    .withMessage('Product IDs must be an array'),

  check('productIds.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID format'),

  validatorMiddleware,
];

exports.incrementUsageValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Coupon id format')
    .custom(async (val, { req }) => {
      const coupon = await db.findOne({
        model: Coupon,
        filter: { _id: val }
      });
      
      if (!coupon) {
        throw new Error('Coupon not found');
      }
      
      if (!coupon.isValid()) {
        throw new Error('Cannot use expired or inactive coupon');
      }
      return true;
    }),
  validatorMiddleware,
];

exports.toggleStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Coupon id format')
    .custom(async (val, { req }) => {
      const coupon = await db.findOne({
        model: Coupon,
        filter: { _id: val }
      });
      
      if (!coupon) {
        throw new Error('Coupon not found');
      }
      return true;
    }),
  validatorMiddleware,
];

// Query parameter validators
exports.queryParamsValidator = [
  check('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  check('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  check('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'name', '-name', 'discount', '-discount', 'expire', '-expire'])
    .withMessage('Sort must be a valid field'),
  
  validatorMiddleware,
];