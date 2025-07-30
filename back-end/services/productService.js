const slugify = require('slugify');
const asyncHandler = require('express-async-handler');
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const factory = require("./handlersFactory");

const Product = require("../models/productModel");


// @desc        Get list of products
// @route       GET /api/v1/products?page=1&limit=5
// @access      Public
exports.getProducts = factory.getAll(Product, "Products");

// @desc        Get specific product by id
// @route       GET /api/v1/products/:id
// @access      Public
exports.getProduct = factory.getOne(Product);

// @desc        Create product
// @route       Post  /api/v1/product
// @access      Private
// Async await
exports.createProduct = factory.createOne(Product);

// @desc        Update specific product 
// @route       PUT /api/v1/products/:id
// @access      Private
exports.updateProduct = factory.updateOne(Product);

// @desc        Delete Specific product
// @route       Post  /api/v1/products/:id
// @access      Private
exports.deleteProduct = factory.deleteOne(Product);