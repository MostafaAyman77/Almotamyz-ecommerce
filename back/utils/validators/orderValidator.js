const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createCashOrderValidator = [
  check("customerName").notEmpty().withMessage("Customer name is required"),

  check("customerPhone")
    .notEmpty()
    .withMessage("Customer phone is required")
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number format"),

  check("shippingAddress")
    .notEmpty()
    .withMessage("Shipping address is required"),

  check("shippingAddress.details")
    .notEmpty()
    .withMessage("Shipping address details are required"),

  check("shippingAddress.phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number format"),

  check("shippingAddress.city").notEmpty().withMessage("City is required"),

  check("shippingAddress.postalCode")
    .optional()
    .isPostalCode("any")
    .withMessage("Invalid postal code format"),

  validatorMiddleware,
];

exports.getOrderValidator = [
  check("id").isMongoId().withMessage("Invalid order id format"),
  validatorMiddleware,
];

exports.updateOrderStatusValidator = [
  check("id").isMongoId().withMessage("Invalid order id format"),
  check("status")
    .notEmpty()
    .withMessage("Order status is required")
    .isIn(["pending", "processing", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid order status"),
  validatorMiddleware,
];

exports.checkoutSessionValidator = [
  check("cartId").isMongoId().withMessage("Invalid cart id format"),
  validatorMiddleware,
];
