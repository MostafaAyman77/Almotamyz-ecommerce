const { check, body } = require("express-validator");
const validatorMiddleware = require("./../../../middlewares/validatorMiddleware");

exports.createOrderValidator = [
  check("cartId")
    .notEmpty()
    .withMessage("Cart ID is required")
    .isMongoId()
    .withMessage("Invalid cart ID format"),
  body("shippingAddress")
    .notEmpty()
    .withMessage("Shipping address is required"),
  body("shippingAddress.details")
    .notEmpty()
    .withMessage("Shipping address details are required"),
  body("shippingAddress.phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number. Must be a valid Egyptian or Saudi number"),
  body("shippingAddress.city")
    .notEmpty()
    .withMessage("City is required"),
  body("shippingAddress.postalCode")
    .optional()
    .isPostalCode("any")
    .withMessage("Invalid postal code"),
  validatorMiddleware,
];

exports.createWalletPaymentValidator = [
  check("cartId")
    .notEmpty()
    .withMessage("Cart ID is required")
    .isMongoId()
    .withMessage("Invalid cart ID format"),
  body("shippingAddress")
    .notEmpty()
    .withMessage("Shipping address is required"),
  body("shippingAddress.details")
    .notEmpty()
    .withMessage("Shipping address details are required"),
  body("shippingAddress.phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number"),
  body("shippingAddress.city")
    .notEmpty()
    .withMessage("City is required"),
  body("phone")
    .notEmpty()
    .withMessage("Wallet phone number is required")
    .isMobilePhone(["ar-EG"])
    .withMessage("Invalid Egyptian phone number for wallet"),
  validatorMiddleware,
];

exports.getOrderValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid order ID format"),
  validatorMiddleware,
];

exports.updateOrderValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid order ID format"),
  validatorMiddleware,
];