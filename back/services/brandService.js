const slugify = require('slugify');
const asyncHandler = require('express-async-handler');
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const factory = require("./handlersFactory");

const Brand = require("../models/brandModel");


// @desc        Get list of brands
// @route       GET /api/v1/brands?page=1&limit=5
// @access      Public
exports.getBrands = factory.getAll(Brand);

// @desc        Get specific brand by id
// @route       GET /api/v1/brands/:id
// @access      Public
exports.getBrand = factory.getOne(Brand);

// @desc        Create brand
// @route       Post  /api/v1/brands
// @access      Private

// Async await
exports.createBrand = factory.createOne(Brand);

// @desc        Update specific brand 
// @route       PUT /api/v1/brands/:id
// @access      Private
exports.updateBrand = factory.updateOne(Brand);

// @desc        Delete Specific brand
// @route       Post  /api/v1/brands/:id
// @access      Private
exports.deleteBrand = factory.deleteOne(Brand);