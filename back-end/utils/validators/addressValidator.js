const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.addAddressValidator = [
  check("alias")
    .optional()
    .isLength({ min: 1 })
    .withMessage("Address alias must be at least 1 character")
    .isLength({ max: 50 })
    .withMessage("Address alias cannot exceed 50 characters"),

  check("details")
    .notEmpty()
    .withMessage("Address details are required")
    .isLength({ min: 5 })
    .withMessage("Address details must be at least 5 characters")
    .isLength({ max: 200 })
    .withMessage("Address details cannot exceed 200 characters"),

  check("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number format"),

  check("city")
    .notEmpty()
    .withMessage("City is required")
    .isLength({ min: 2 })
    .withMessage("City must be at least 2 characters")
    .isLength({ max: 50 })
    .withMessage("City cannot exceed 50 characters"),

  check("postalCode")
    .optional()
    .isLength({ min: 5 })
    .withMessage("Postal code must be at least 5 characters")
    .isLength({ max: 10 })
    .withMessage("Postal code cannot exceed 10 characters"),

  validatorMiddleware,
];

exports.removeAddressValidator = [
  check("addressId").isMongoId().withMessage("Invalid address id format"),
  validatorMiddleware,
];

exports.updateAddressValidator = [
  check("addressId").isMongoId().withMessage("Invalid address id format"),

  check("alias")
    .optional()
    .isLength({ min: 1 })
    .withMessage("Address alias must be at least 1 character")
    .isLength({ max: 50 })
    .withMessage("Address alias cannot exceed 50 characters"),

  check("details")
    .optional()
    .isLength({ min: 5 })
    .withMessage("Address details must be at least 5 characters")
    .isLength({ max: 200 })
    .withMessage("Address details cannot exceed 200 characters"),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number format"),

  check("city")
    .optional()
    .isLength({ min: 2 })
    .withMessage("City must be at least 2 characters")
    .isLength({ max: 50 })
    .withMessage("City cannot exceed 50 characters"),

  check("postalCode")
    .optional()
    .isLength({ min: 5 })
    .withMessage("Postal code must be at least 5 characters")
    .isLength({ max: 10 })
    .withMessage("Postal code cannot exceed 10 characters"),

  validatorMiddleware,
];

exports.getAddressValidator = [
  check("addressId").isMongoId().withMessage("Invalid address id format"),
  validatorMiddleware,
];
