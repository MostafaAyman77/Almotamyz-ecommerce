const { body, param, query } = require('express-validator');
const { findOne } = require('../../../services/DB/db.services');
const Order = require('./../../../models/order/orderModel');
const validatorMiddleware = require('../../../middlewares/validatorMiddleware.js');

// Validation for creating new order
exports.createOrderValidation = [
  body('shippingAddress.details')
    .notEmpty()
    .withMessage('Shipping address details are required'),

  body('shippingAddress.phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Invalid phone number format'),

  body('shippingAddress.city')
    .notEmpty()
    .withMessage('City is required'),

  body('shippingAddress.postalCode')
    .notEmpty()
    .withMessage('Postal code is required'),

  body('paymentMethodType')
    .optional()
    .isIn(['card', 'cash'])
    .withMessage('Payment method must be either card or cash'),

  body('coupon')
    .optional()
    .isString()
    .withMessage('Coupon must be a string'),

  // Custom validation to check for existing pending order
  body().custom(async (value, { req }) => {
    const userId = req.user._id;

    // Check if user already has a pending order
    const existingPendingOrder = await findOne({
      model: Order,
      filter: {
        user: userId,
        orderStatus: 'pending',
        isDeleted: { $ne: true }
      }
    });

    if (existingPendingOrder) {
      throw new Error('You already have a pending order. Please complete or cancel it before creating a new one.');
    }

    return true;
  }),
  validatorMiddleware
];

// Validation for updating order status
exports.updateOrderStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID format'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  validatorMiddleware
];

// Validation for updating payment status
exports.updatePaymentStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID format'),

  body('paymentStatus')
    .notEmpty()
    .withMessage('Payment status is required')
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Invalid payment status'),
    validatorMiddleware
];

// Validation for order ID parameter
exports.orderIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID format'),
    validatorMiddleware
];

// Validation for query parameters
exports.orderQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status value'),

  query('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Invalid payment status value'),
    validatorMiddleware
];