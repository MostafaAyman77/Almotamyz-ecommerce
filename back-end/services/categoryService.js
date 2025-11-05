const slugify = require('slugify');
const asyncHandler = require('express-async-handler');
const ApiError = require("../utils/apiError");
const Category = require("../models/categoryModel");
const db = require("./DB/db.services");

// @desc    Get list of categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, sort = "createdAt", name, slug } = req.query;
  
  // Build filter object from validated query params
  const filter = { isDeleted: { $ne: true } };
  
  if (name) {
    filter.name = { $regex: name, $options: 'i' }; // Case-insensitive search
  }
  
  if (slug) {
    filter.slug = { $regex: slug, $options: 'i' };
  }

  const sortObj = {};
  if (sort) {
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    sortObj[sortField] = sort.startsWith('-') ? -1 : 1;
  }

  const result = await db.findWithPagination({
    model: Category,
    filter,
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortObj,
    select: '-__v'
  });

  res.status(200).json({
    status: 'success',
    results: result.data.length,
    pagination: result.pagination,
    data: result.data
  });
});

// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const category = await db.findNonDeleted({
    model: Category,
    filter: { _id: id },
    select: '-__v'
  });

  if (!category) {
    return next(new ApiError(`No category found with this id: ${id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: category
  });
});

// @desc    Create Category
// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name, description, image } = req.body;
  
  // Check if category already exists (non-deleted)
  const existingCategory = await db.findNonDeleted({
    model: Category,
    filter: { name }
  });

  if (existingCategory) {
    return next(new ApiError('Category with this name already exists', 400));
  }

  // Create slug
  const slug = slugify(name, { lower: true });
  
  const categoryData = {
    name,
    slug,
    description,
    image,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const category = await db.create({
    model: Category,
    data: categoryData
  });

  // Remove version field from response
  const { __v, ...categoryResponse } = category.toObject();

  res.status(201).json({
    status: 'success',
    data: categoryResponse
  });
});

// @desc    Update specific category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, image } = req.body;

  // Check if category exists and is not deleted
  const existingCategory = await db.findNonDeleted({
    model: Category,
    filter: { _id: id }
  });

  if (!existingCategory) {
    return next(new ApiError(`No category found with this id: ${id}`, 404));
  }

  // Check if new name already exists (excluding current category)
  if (name && name !== existingCategory.name) {
    const duplicateCategory = await db.findNonDeleted({
      model: Category,
      filter: { name, _id: { $ne: id } }
    });

    if (duplicateCategory) {
      return next(new ApiError('Category with this name already exists', 400));
    }
  }

  const updateData = {
    ...(name && { name }),
    ...(name && { slug: slugify(name, { lower: true }) }),
    ...(description && { description }),
    ...(image && { image }),
    updatedAt: new Date()
  };

  const updatedCategory = await db.findByIdAndUpdate({
    model: Category,
    id,
    data: updateData
  });

  // Remove version field from response
  const { __v, ...categoryResponse } = updatedCategory.toObject();

  res.status(200).json({
    status: 'success',
    data: categoryResponse
  });
});

// @desc    Delete Specific Category (Soft Delete)
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if category exists and is not already deleted
  const category = await db.findNonDeleted({
    model: Category,
    filter: { _id: id }
  });

  if (!category) {
    return next(new ApiError(`No category found with this id: ${id}`, 404));
  }

  // Perform soft delete
  await db.softDelete({
    model: Category,
    filter: { _id: id }
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Restore Soft Deleted Category
// @route   PATCH /api/v1/categories/:id/restore
// @access  Private/Admin
exports.restoreCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if category exists (including deleted ones)
  const category = await db.findOne({
    model: Category,
    filter: { _id: id }
  });

  if (!category) {
    return next(new ApiError(`No category found with this id: ${id}`, 404));
  }

  if (!category.isDeleted) {
    return next(new ApiError('Category is not deleted', 400));
  }

  // Restore the category
  const restoredCategory = await db.restoreSoftDelete({
    model: Category,
    filter: { _id: id }
  });

  // Remove version field from response
  const { __v, ...categoryResponse } = restoredCategory.toObject();

  res.status(200).json({
    status: 'success',
    data: categoryResponse
  });
});

// @desc    Get Deleted Categories
// @route   GET /api/v1/categories/deleted
// @access  Private/Admin
exports.getDeletedCategories = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await db.findWithPagination({
    model: Category,
    filter: { isDeleted: true },
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { deletedAt: -1 },
    select: '-__v'
  });

  res.status(200).json({
    status: 'success',
    results: result.data.length,
    pagination: result.pagination,
    data: result.data
  });
});