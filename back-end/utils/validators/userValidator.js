const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');
const { userRole } = require('../../enum');

const patterns = {
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
}

exports.getUserValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid User id format'),
  validatorMiddleware,
];

exports.createUserValidator = [
  check('name')
    .notEmpty()
    .withMessage('User name is required')
    .isLength({ min: 3 })
    .withMessage('User name must be at least 3 characters')
    .isLength({ max: 32 })
    .withMessage('User name must not exceed 32 characters'),

  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        throw new Error('Email already exists');
      }
      return true;
    }),

  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(patterns.password)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),

  check('slug')
    .optional(),

  check('role')
    .optional()
    .isIn(Object.values(userRole))
    .withMessage(`Role must be one of: ${Object.values(userRole).join(', ')}`),

  check('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean value'),

  check('isVerified')
    .optional()
    .isBoolean()
    .withMessage('IsVerified must be a boolean value'),

  validatorMiddleware,
];

exports.updateUserValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid User id format'),

  check('name')
    .optional()
    .isLength({ min: 3 })
    .withMessage('User name must be at least 3 characters')
    .isLength({ max: 32 })
    .withMessage('User name must not exceed 32 characters'),

  check('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
    .custom(async (val, { req }) => {
      const user = await User.findOne({ email: val });
      if (user && user._id.toString() !== req.params.id) {
        throw new Error('Email already exists');
      }
      return true;
    }),

  check('slug')
    .optional(),

  check('role')
    .optional()
    .isIn(Object.values(userRole))
    .withMessage(`Role must be one of: ${Object.values(userRole).join(', ')}`),

  check('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean value'),

  check('isVerified')
    .optional()
    .isBoolean()
    .withMessage('IsVerified must be a boolean value'),

  body('password')
    .isEmpty()
    .withMessage('Use change password endpoint to update password'),

  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid User id format'),

  check('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  check('password')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(patterns.password)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .custom((val, { req }) => {
      if (val === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),

  validatorMiddleware,
];

exports.deleteUserValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid User id format'),
  validatorMiddleware,
];

exports.updateLoggedUserValidator = [
  check('name')
    .optional()
    .isLength({ min: 3 })
    .withMessage('User name must be at least 3 characters')
    .isLength({ max: 32 })
    .withMessage('User name must not exceed 32 characters'),

  check('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
    .custom(async (val, { req }) => {
      const user = await User.findOne({ email: val });
      if (user && user._id.toString() !== req.user._id.toString()) {
        throw new Error('Email already exists');
      }
      return true;
    }),

  check('slug')
    .optional(),

  body('password')
    .isEmpty()
    .withMessage('Use change password endpoint to update password'),

  body('role')
    .isEmpty()
    .withMessage('You cannot update your role'),

  body('active')
    .isEmpty()
    .withMessage('You cannot update your active status'),

  body('isVerified')
    .isEmpty()
    .withMessage('You cannot update your verification status'),

  validatorMiddleware,
];

exports.updateLoggedUserPasswordValidator = [
  check('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  check('password')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(patterns.password)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .custom((val, { req }) => {
      if (val === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),

  validatorMiddleware,
];

exports.addAddressValidator = [
  check('alias')
    .notEmpty()
    .withMessage('Address alias is required')
    .isLength({ min: 2 })
    .withMessage('Alias must be at least 2 characters'),

  check('details')
    .notEmpty()
    .withMessage('Address details are required')
    .isLength({ min: 10 })
    .withMessage('Address details must be at least 10 characters'),

  check('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone(['ar-EG', 'ar-SA', 'en-US'])
    .withMessage('Invalid phone number format'),

  check('city')
    .notEmpty()
    .withMessage('City is required'),

  check('postalCode')
    .optional()
    .isPostalCode('any')
    .withMessage('Invalid postal code format'),

  validatorMiddleware,
];

exports.removeAddressValidator = [
  check('addressId')
    .notEmpty()
    .withMessage('Address ID is required')
    .isMongoId()
    .withMessage('Invalid Address ID format')
    .custom(async (val, { req }) => {
      // Check if the address exists in the user's addresses array
      const user = await User.findById(req.user._id);
      
      if (!user) {
        throw new Error('User not found');
      }

      const addressExists = user.addresses.some(
        address => address._id.toString() === val
      );

      if (!addressExists) {
        throw new Error('Address not found in your addresses');
      }

      return true;
    }),

  validatorMiddleware,
];

exports.getUsersValidator = [
  check('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  check('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  check('keyword')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Keyword must not exceed 100 characters')
    .trim(),

  check('role')
    .optional()
    .isIn(Object.values(userRole))
    .withMessage(`Role must be one of: ${Object.values(userRole).join(', ')}`),

  check('active')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Active must be either "true" or "false"'),

  check('isVerified')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('IsVerified must be either "true" or "false"'),

  validatorMiddleware,
];