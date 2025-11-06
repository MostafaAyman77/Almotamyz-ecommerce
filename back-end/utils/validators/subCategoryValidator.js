const slugify = require("slugify");
const { check, body, query } = require('express-validator');
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory id format"),
  validatorMiddleware,
];

exports.createSubCategoryValidator = [
  check("name")
    .notEmpty().withMessage("SubCategory name is required")
    .isLength({ min: 2 }).withMessage("Too short SubCategory name (min 2 characters)")    
    .isLength({ max: 32 }).withMessage("Too long SubCategory name (max 32 characters)")
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  
  check("category")
    .notEmpty().withMessage("SubCategory must belong to a category")
    .isMongoId().withMessage("Invalid category ID"),
  
  validatorMiddleware,
];

exports.updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory id format"),
  
  body("name")
    .optional()
    .isLength({ min: 2 }).withMessage("Too short SubCategory name (min 2 characters)")    
    .isLength({ max: 32 }).withMessage("Too long SubCategory name (max 32 characters)")
    .custom((val, { req }) => {
      if (val) {
        req.body.slug = slugify(val, { lower: true });
      }
      return true;
    }),
  
  body("category")
    .optional()
    .isMongoId().withMessage("Invalid category ID"),
  
  validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory id format"),
  validatorMiddleware,
];

exports.restoreSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory id format"),
  validatorMiddleware,
];

exports.getSubCategoriesValidator = [
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
  
  query("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID for filtering"),
  
  validatorMiddleware,
];

exports.getDeletedSubCategoriesValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  
  query("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID for filtering"),
  
  validatorMiddleware,
];

exports.getDeletedSubCategoriesValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  
  query("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID for filtering"),
  
  query("sort")
    .optional()
    .isIn(["name", "-name", "createdAt", "-createdAt", "deletedAt", "-deletedAt", "updatedAt", "-updatedAt"])
    .withMessage("Sort must be one of: name, -name, createdAt, -createdAt, deletedAt, -deletedAt, updatedAt, -updatedAt"),
  
  validatorMiddleware,
];