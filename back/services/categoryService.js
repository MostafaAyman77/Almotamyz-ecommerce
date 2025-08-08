const slugify = require('slugify');
const asyncHandler = require('express-async-handler');
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const factory = require("./handlersFactory");

const Category = require("../models/categoryModel");


// @desc        Get list of categories
// @route       GET /api/v1/categories?page=1&limit=5
// @access      Public
exports.getCategories = factory.getAll(Category);

// @desc        Get specific category by id
// @route       GET /api/v1/categories/:id
// @access      Public
exports.getCategory = factory.getOne(Category);

// @desc        Create Category
// @route       Post  /api/v1/category
// @access      Private

// Async await
exports.createCategory = factory.createOne(Category);

// @desc        Update specific category 
// @route       PUT /api/v1/categories/:id
// @access      Private
exports.updateCategory = factory.updateOne(Category);

// @desc        Delete Specific Category
// @route       Post  /api/v1/categories/:id
// @access      Private
exports.deleteCategory = factory.deleteOne(Category);