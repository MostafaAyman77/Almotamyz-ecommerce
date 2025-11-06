const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const SubCategory = require("../models/subCategoryModel");
const db = require("./DB/db.services");

exports.setCategoryIdBody = (req, res, next) => {
  // Nested route
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

exports.createFilterObject = (req, res, next) => {
  let filterObject = { isDeleted: { $ne: true } };
  if (req.params.categoryId) filterObject = { ...filterObject, category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};

// @desc    Get list of subcategories
// @route   GET /api/v1/subcategories
// @access  Public
exports.getSubCategories = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, sort = "createdAt", name, slug, category } = req.query;
  
  // Build filter object
  const filter = { isDeleted: { $ne: true } };
  
  if (name) {
    filter.name = { $regex: name, $options: 'i' };
  }
  
  if (slug) {
    filter.slug = { $regex: slug, $options: 'i' };
  }

  if (category) {
    filter.category = category;
  }

  // Use filter from nested route if exists
  const finalFilter = req.filterObj ? { ...filter, ...req.filterObj } : filter;

  const sortObj = {};
  if (sort) {
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    sortObj[sortField] = sort.startsWith('-') ? -1 : 1;
  }

  const result = await db.findWithPagination({
    model: SubCategory,
    filter: finalFilter,
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortObj,
    select: '-__v'
  });

  // Populate category name
  const populatedData = await Promise.all(
    result.data.map(async (subCategory) => {
      return await db.populate({
        model: SubCategory,
        query: SubCategory.findById(subCategory._id),
        path: 'category',
        select: 'name slug'
      });
    })
  );

  res.status(200).json({
    status: 'success',
    results: populatedData.length,
    pagination: result.pagination,
    data: populatedData
  });
});

// @desc    Get specific subcategory by id
// @route   GET /api/v1/subcategories/:id
// @access  Public
exports.getSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  let subCategory = await db.findNonDeleted({
    model: SubCategory,
    filter: { _id: id },
    select: '-__v'
  });

  if (!subCategory) {
    return next(new ApiError(`No subcategory found with this id: ${id}`, 404));
  }

  // Populate category information
  subCategory = await db.populate({
    model: SubCategory,
    query: SubCategory.findById(subCategory._id),
    path: 'category',
    select: 'name slug'
  });

  res.status(200).json({
    status: 'success',
    data: subCategory
  });
});

// @desc    Create SubCategory
// @route   POST /api/v1/subcategories
// @access  Private/Admin
exports.createSubCategory = asyncHandler(async (req, res, next) => {
  const { name, description, category } = req.body;
  
  // Check if subcategory already exists (non-deleted)
  const existingSubCategory = await db.findNonDeleted({
    model: SubCategory,
    filter: { name, category }
  });

  if (existingSubCategory) {
    return next(new ApiError('SubCategory with this name already exists in this category', 400));
  }

  // Create slug
  const slug = slugify(name, { lower: true });
  
  const subCategoryData = {
    name,
    slug,
    category,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const subCategory = await db.create({
    model: SubCategory,
    data: subCategoryData
  });

  // Populate category information
  const populatedSubCategory = await db.populate({
    model: SubCategory,
    query: SubCategory.findById(subCategory._id),
    path: 'category',
    select: 'name slug'
  });

  // Remove version field from response
  const { __v, ...subCategoryResponse } = populatedSubCategory.toObject();

  res.status(201).json({
    status: 'success',
    data: subCategoryResponse
  });
});

// @desc    Update specific subcategory
// @route   PUT /api/v1/subcategories/:id
// @access  Private/Admin
exports.updateSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, category } = req.body;

  // Check if subcategory exists and is not deleted
  const existingSubCategory = await db.findNonDeleted({
    model: SubCategory,
    filter: { _id: id }
  });

  if (!existingSubCategory) {
    return next(new ApiError(`No subcategory found with this id: ${id}`, 404));
  }

  // Check if new name already exists in the same category (excluding current subcategory)
  if (name && name !== existingSubCategory.name) {
    const duplicateSubCategory = await db.findNonDeleted({
      model: SubCategory,
      filter: { 
        name, 
        category: category || existingSubCategory.category,
        _id: { $ne: id }
      }
    });

    if (duplicateSubCategory) {
      return next(new ApiError('SubCategory with this name already exists in this category', 400));
    }
  }

  const updateData = {
    ...(name && { name }),
    ...(name && { slug: slugify(name, { lower: true }) }),
    ...(category && { category }),
    updatedAt: new Date()
  };

  const updatedSubCategory = await db.findByIdAndUpdate({
    model: SubCategory,
    id,
    data: updateData
  });

  // Populate category information
  const populatedSubCategory = await db.populate({
    model: SubCategory,
    query: SubCategory.findById(updatedSubCategory._id),
    path: 'category',
    select: 'name slug'
  });

  // Remove version field from response
  const { __v, ...subCategoryResponse } = populatedSubCategory.toObject();

  res.status(200).json({
    status: 'success',
    data: subCategoryResponse
  });
});

// @desc    Delete Specific SubCategory (Soft Delete)
// @route   DELETE /api/v1/subcategories/:id
// @access  Private/Admin
exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if subcategory exists and is not already deleted
  const subCategory = await db.findNonDeleted({
    model: SubCategory,
    filter: { _id: id }
  });

  if (!subCategory) {
    return next(new ApiError(`No subcategory found with this id: ${id}`, 404));
  }

  // Perform soft delete
  await db.softDelete({
    model: SubCategory,
    filter: { _id: id }
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Restore Soft Deleted SubCategory
// @route   PATCH /api/v1/subcategories/:id/restore
// @access  Private/Admin
exports.restoreSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if subcategory exists (including deleted ones)
  const subCategory = await db.findOne({
    model: SubCategory,
    filter: { _id: id }
  });

  if (!subCategory) {
    return next(new ApiError(`No subcategory found with this id: ${id}`, 404));
  }

  if (!subCategory.isDeleted) {
    return next(new ApiError('SubCategory is not deleted', 400));
  }

  // Restore the subcategory
  const restoredSubCategory = await db.restoreSoftDelete({
    model: SubCategory,
    filter: { _id: id }
  });

  // Populate category information
  const populatedSubCategory = await db.populate({
    model: SubCategory,
    query: SubCategory.findById(restoredSubCategory._id),
    path: 'category',
    select: 'name slug'
  });

  // Remove version field from response
  const { __v, ...subCategoryResponse } = populatedSubCategory.toObject();

  res.status(200).json({
    status: 'success',
    data: subCategoryResponse
  });
});

// @desc    Get Deleted SubCategories
// @route   GET /api/v1/subcategories/deleted/all
// @access  Private/Admin
exports.getDeletedSubCategories = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, category } = req.query;

  const filter = { isDeleted: true };
  if (category) {
    filter.category = category;
  }

  const result = await db.findWithPagination({
    model: SubCategory,
    filter,
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { deletedAt: -1 },
    select: '-__v'
  });

  // Populate category information
  const populatedData = await Promise.all(
    result.data.map(async (subCategory) => {
      return await db.populate({
        model: SubCategory,
        query: SubCategory.findById(subCategory._id),
        path: 'category',
        select: 'name slug'
      });
    })
  );

  res.status(200).json({
    status: 'success',
    results: populatedData.length,
    pagination: result.pagination,
    data: populatedData
  });
});

// @desc    Get Deleted SubCategories
// @route   GET /api/v1/subcategories/deleted/all
// @access  Private/Admin
exports.getDeletedSubCategories = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, category, sort = "-deletedAt" } = req.query;

  const filter = { isDeleted: true };
  if (category) {
    filter.category = category;
  }

  // Fix: Convert sort string to sort object
  const sortObj = {};
  if (sort) {
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    sortObj[sortField] = sort.startsWith('-') ? -1 : 1;
  }

  const result = await db.findWithPagination({
    model: SubCategory,
    filter,
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortObj, // Pass the sort object instead of string
    select: '-__v'
  });

  // Populate category information
  const populatedData = await Promise.all(
    result.data.map(async (subCategory) => {
      return await db.populate({
        model: SubCategory,
        query: SubCategory.findById(subCategory._id),
        path: 'category',
        select: 'name slug'
      });
    })
  );

  res.status(200).json({
    status: 'success',
    results: populatedData.length,
    pagination: result.pagination,
    data: populatedData
  });
});