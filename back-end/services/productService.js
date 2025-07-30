const slugify = require('slugify');
const asyncHandler = require('express-async-handler');
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

const Product = require("../models/productModel");


// @desc        Get list of products
// @route       GET /api/v1/products?page=1&limit=5
// @access      Public
exports.getProducts = asyncHandler(async (req,res) => { 
    //  Build Query
    const documentsCounts = await Product.countDocuments();
    const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .paginate(documentsCounts)
    .filter()
    .search()
    .limitFields()
    .sort();

    // Execute Query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const products = await mongooseQuery; 
    
    res.status(200).json({ results: products.length, paginationResult, data: products});
});

// @desc        Get specific product by id
// @route       GET /api/v1/products/:id
// @access      Public
exports.getProduct = asyncHandler( async(req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate({
        path: "category", select: "name -_id"
    });
    if(!product) {
        // res.status(404).json({message: `No product for this id ${id}`});
        return next(new ApiError(`No product for this id ${id}`, 404));
    }
    res.status(200).json({data: product});
});

// @desc        Create product
// @route       Post  /api/v1/product
// @access      Private
// Async await
exports.createProduct = asyncHandler( async (req,res) => {
    req.body.slug = slugify(req.body.title);
    const product = await Product.create(req.body);
    res.status(201).json({data: product});
});

// @desc        Update specific product 
// @route       PUT /api/v1/products/:id
// @access      Private
exports.updateProduct = asyncHandler(async(req, res, next) => {
    const { id } = req.params;
    if(req.body.title) {
        req.body.slug = slugify(req.body.title);
    }

    const product = await Product.findOneAndUpdate({_id: id}, req.body, {new: true});
    if(!product) {
        // res.status(404).json({ message: `No product for this id ${id}` });
        return next(new ApiError(`No product for this id ${id}`, 404));
    }
    res.status(200).json({data: product});
});

// @desc        Delete Specific product
// @route       Post  /api/v1/products/:id
// @access      Private
exports.deleteProduct = asyncHandler(async(req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if(!product) {
        // res.status(404).json({ message: `No product for this id ${id}` });
        return next(new ApiError(`No product for this id ${id}`, 404));
    }
    res.status(204).send();
});