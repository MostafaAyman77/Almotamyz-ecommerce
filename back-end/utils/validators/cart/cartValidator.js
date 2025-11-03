const { check, body } = require("express-validator");
const validatorMiddleware = require("../../../middlewares/validatorMiddleware");

exports.addProductToCartValidator = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid Product ID format"),
  body("color")
    .optional()
    .isString()
    .withMessage("Color must be a string"),
  validatorMiddleware,
];

exports.removeCartItemValidator = [
  check("itemId")
    .isMongoId()
    .withMessage("Invalid cart item ID format"),
  validatorMiddleware,
];

exports.updateCartItemQuantityValidator = [
  check("itemId")
    .isMongoId()
    .withMessage("Invalid cart item ID format"),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  validatorMiddleware,
];

exports.applyCouponValidator = [
  body("coupon")
    .notEmpty()
    .withMessage("Coupon name is required")
    .isString()
    .withMessage("Coupon must be a string")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Coupon name must be between 2 and 50 characters"),
  validatorMiddleware,
];