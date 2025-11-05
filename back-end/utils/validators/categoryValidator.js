const slugify = require("slugify");
const { check, body, query } = require('express-validator');
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];

exports.createCategoryValidator = [
  check("name")
    .notEmpty().withMessage("Category name is required")
    .isLength({ min: 3 }).withMessage("Too short category name")    
    .isLength({ max: 32 }).withMessage("Too long category name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  body("name")
    .optional()
    .isLength({ min: 3 }).withMessage("Too short category name")    
    .isLength({ max: 32 }).withMessage("Too long category name")
    .custom((val, { req }) => {
      if (val) {
        req.body.slug = slugify(val);
      }
      return true;
    }),
  validatorMiddleware,
];

exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];

exports.restoreCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];

exports.getCategoriesValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  
  query("sort")
    .optional()
    .isIn(["name", "-name", "createdAt", "-createdAt", "updatedAt", "-updatedAt"])
    .withMessage("Sort must be one of: name, -name, createdAt, -createdAt, updatedAt, -updatedAt"),
  
  query("name")
    .optional()
    .isLength({ min: 1, max: 32 })
    .withMessage("Name filter must be between 1 and 32 characters")
    .trim(),
  
  query("slug")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("Slug filter must be between 1 and 50 characters")
    .trim(),
  
  validatorMiddleware,
];


exports.getDeletedCategoriesValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  
  validatorMiddleware,
];