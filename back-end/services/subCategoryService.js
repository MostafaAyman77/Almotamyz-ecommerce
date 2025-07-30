const slugify = require('slugify');
const asyncHandler = require('express-async-handler');
const ApiError = require("../utils/apiError");

const SubCategory = require("../models/subCategoryModel");

exports.setCategoryIdBody = (req, res, next) => {
    // Nested route
    if(!req.body.category) req.body.category = req.params.categoryId;
    next();
}
// @desc        Create subCategory
// @route       Post  /api/v1/category
// @access      Private
// Async await
exports.createSubCategory = asyncHandler( async (req,res) => {


    const {name, category} = req.body;
        const subCategory = await SubCategory.create({
            name, 
            slug: slugify(name),
            category
        });
        res.status(201).json({data: subCategory});
});

// Nested Route
// GET /api/vi/categories/:categoryId/subcategories
// GET /api/vi/products/:productId/reviews

exports.createFilterObject = (req, res, next) => {
    let filterObject = {};
    if(req.params.categoryId) filterObject = { category: req.params.categoryId };
    req.filterObj = filterObject;
    next();
}

// @desc        Get list of subcategories
// @route       GET /api/v1/categories?page=1&limit=5
// @access      Public
exports.getSubCategories = asyncHandler(async (req,res) => {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;
    const skip = (page - 1) * limit; 

    const subCategories = await SubCategory.find(req.filterObj)
    .skip(skip)
    .limit(limit)
    // .populate({ path: "category", select: "name -_id" });
    res.status(200).json({results: subCategories.length, page, data: subCategories});
    res.send();
});

// @desc        Get specific subcategory by id
// @route       GET /api/v1/subcategories/:id
// @access      Public
exports.getSubCategory = asyncHandler( async(req, res, next) => {
    const { id } = req.params;
    const subCategory = await SubCategory.findById(id)
    // .populate({ path: "category", select: "name -_id" });
    if(!subCategory) {
        // res.status(404).json({message: `No category for this id ${id}`});
        return next(new ApiError(`No subcategory for this id ${id}`, 404));
    }
    res.status(200).json({data: subCategory});
});

// @desc        Update specific subcategory 
// @route       PUT /api/v1/subcategories/:id
// @access      Private
exports.updateSubCategory = asyncHandler(async(req, res, next) => {
    const { id } = req.params;
    const {name, category} = req.body;

    const subCategory = await SubCategory.findOneAndUpdate(
        {_id: id},
        {name, slug: slugify(name), category},
        {new: true}
    );
    if(!subCategory) {
        // res.status(404).json({ message: `No category for this id ${id}` });
        return next(new ApiError(`No subcategory for this id ${id}`, 404));
    }
    res.status(200).json({data: subCategory});
});

// @desc        Delete Specific subCategory
// @route       Post  /api/v1/subcategories/:id
// @access      Private
exports.deleteSubCategory = asyncHandler(async(req, res, next) => {
    const { id } = req.params;
    const subCategory = await SubCategory.findByIdAndDelete(id);
    if(!subCategory) {
        // res.status(404).json({ message: `No category for this id ${id}` });
        return next(new ApiError(`No subcategory for this id ${id}`, 404));
    }
    res.status(204).send();
});