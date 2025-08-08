const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const factory = require("./handlersFactory");

const SubCategory = require("../models/subCategoryModel");

exports.setCategoryIdBody = (req, res, next) => {
  // Nested route
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};
// @desc        Create subCategory
// @route       Post  /api/v1/category
// @access      Private
// Async await
exports.createSubCategory = factory.createOne(SubCategory);

// Nested Route
// GET /api/vi/categories/:categoryId/subcategories
// GET /api/vi/products/:productId/reviews

exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};

// @desc        Get list of subcategories
// @route       GET /api/v1/categories?page=1&limit=5
// @access      Public
exports.getSubCategories = factory.getAll(SubCategory);

// @desc        Get specific subcategory by id
// @route       GET /api/v1/subcategories/:id
// @access      Public
exports.getSubCategory = factory.getOne(SubCategory);

// @desc        Update specific subcategory
// @route       PUT /api/v1/subcategories/:id
// @access      Private
exports.updateSubCategory = factory.updateOne(SubCategory);

// @desc        Delete Specific subCategory
// @route       Post  /api/v1/subcategories/:id
// @access      Private
exports.deleteSubCategory = factory.deleteOne(SubCategory);
