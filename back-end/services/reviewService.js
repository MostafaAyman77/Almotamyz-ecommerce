const asyncHandler = require("express-async-handler");
const db = require("./DB/db.services");
const Review = require("../models/reviewModel");
const ApiError = require("../utils/apiError");

// Nested route
// GET /api/v1/products/:productId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObj = filterObject;
  next();
};

// @desc    Get list of reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, sort = "-createdAt" } = req.query;
  
  // Build sort object
  const sortObj = {};
  if (sort) {
    const sortFields = sort.split(",");
    sortFields.forEach(field => {
      if (field.startsWith("-")) {
        sortObj[field.slice(1)] = -1;
      } else {
        sortObj[field] = 1;
      }
    });
  }

  const result = await db.findWithPagination({
    model: Review,
    filter: req.filterObj || {},
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortObj
  });

  res.status(200).json({
    status: "success",
    results: result.data.length,
    pagination: result.pagination,
    data: result.data,
  });
});

// @desc    Get specific review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const review = await db.findOne({
    model: Review,
    filter: { _id: id },
    options: { lean: true }
  });

  if (!review) {
    return next(new ApiError(`No review found with id: ${id}`, 404));
  }

  res.status(200).json({
    status: "success",
    data: review,
  });
});

// Nested route (Create)
// POST /api/v1/products/:productId/reviews
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  // if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// @desc    Create review
// @route   POST  /api/v1/reviews
// @access  Private/Protect/User
exports.createReview = asyncHandler(async (req, res, next) => {
  // Check if user already reviewed this product
  const existingReview = await db.findOne({
    model: Review,
    filter: {
      user: req.body.user,
      product: req.body.product
    }
  });

  if (existingReview) {
    return next(new ApiError('You have already reviewed this product', 400));
  }

  const review = await db.create({
    model: Review,
    data: req.body
  });

  // Populate user data for response
  const populatedReview = await db.populate({
    model: Review,
    query: Review.findById(review._id),
    path: 'user',
    select: 'name'
  });

  res.status(201).json({
    status: "success",
    data: populatedReview,
  });
});

// @desc    Update specific review
// @route   PUT /api/v1/reviews/:id
// @access  Private/Protect/User
exports.updateReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const review = await db.findOne({
    model: Review,
    filter: { _id: id }
  });

  if (!review) {
    return next(new ApiError(`No review found with id: ${id}`, 404));
  }

  // Check if user owns the review
  if (review.user._id.toString() !== req.user._id.toString()) {
    return next(new ApiError(`You are not allowed to perform this action`, 403));
  }

  const updatedReview = await db.findByIdAndUpdate({
    model: Review,
    id: id,
    data: req.body
  });



  res.status(200).json({
    status: "success",
    data: updatedReview,
  });
});

// @desc    Delete specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Protect/User-Admin-Manager
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const review = await db.findOne({
    model: Review,
    filter: { _id: id }
  });

  if (!review) {
    return next(new ApiError(`No review found with id: ${id}`, 404));
  }

  // Check permissions
  if (
    req.user.role === "user" &&
    review.user._id.toString() !== req.user._id.toString()
  ) {
    return next(new ApiError(`You are not allowed to perform this action`, 403));
  }

  await db.findByIdAndDelete({
    model: Review,
    id: id
  });

  res.status(204).send();
});

// @desc    Mark review as helpful
// @route   PUT /api/v1/reviews/:id/helpful
// @access  Private/Protect/User
exports.markReviewAsHelpful = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const review = await db.findOne({
    model: Review,
    filter: { _id: id }
  });

  if (!review) {
    return next(new ApiError(`No review found with id: ${id}`, 404));
  }

  const updatedReview = await db.findByIdAndUpdate({
    model: Review,
    id: id,
    data: { $inc: { helpful: 1 } }
  });

  res.status(200).json({
    status: "success",
    data: updatedReview,
  });
});

// @desc    Get reviews for a specific product
// @route   GET /api/v1/products/:productId/reviews
// @access  Public
exports.getProductReviews = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const result = await db.findWithPagination({
    model: Review,
    filter: { product: productId },
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 }
  });

  // Populate user data
  const populatedData = await Promise.all(
    result.data.map(async (review) => {
      return await db.populate({
        model: Review,
        query: Review.findById(review._id),
        path: 'user',
        select: 'name'
      });
    })
  );

  res.status(200).json({
    status: "success",
    results: populatedData.length,
    pagination: result.pagination,
    data: populatedData,
  });
});

// @desc    Get user's reviews
// @route   GET /api/v1/reviews/myReviews
// @access  Private/Protect/User
exports.getUserReviews = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await db.findWithPagination({
    model: Review,
    filter: { user: req.user._id },
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 }
  });

  // Populate product data
  const populatedData = await Promise.all(
    result.data.map(async (review) => {
      return await db.populate({
        model: Review,
        query: Review.findById(review._id),
        path: 'product',
        select: 'title imageCover'
      });
    })
  );

  res.status(200).json({
    status: "success",
    results: populatedData.length,
    pagination: result.pagination,
    data: populatedData,
  });
});

