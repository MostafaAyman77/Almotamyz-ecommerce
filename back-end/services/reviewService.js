const asyncHandler = require("express-async-handler");

const factory = require("./handlersFactory");
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
exports.getReviews = factory.getAll(Review);

// @desc    Get specific review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = factory.getOne(Review);

// Nested route (Create)
// POST /api/v1/products/:productId/reviews
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// @desc    Create review
// @route   POST  /api/v1/reviews
// @access  Private/Protect/User
exports.createReview = factory.createOne(Review);

// @desc    Update specific review
// @route   PUT /api/v1/reviews/:id
// @access  Private/Protect/User
exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ApiError(`There is no review with id ${req.params.id}`, 404)
    );
  }

  if (review.user._id.toString() !== req.user._id.toString()) {
    return next(
      new ApiError(`Your are not allowed to perform this action`, 403)
    );
  }

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  // Trigger save middleware to recalculate ratings
  updatedReview.save();

  res.status(200).json({ data: updatedReview });
});

// @desc    Delete specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Protect/User-Admin-Manager
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ApiError(`There is no review with id ${req.params.id}`, 404)
    );
  }

  if (
    req.user.role === "user" &&
    review.user._id.toString() !== req.user._id.toString()
  ) {
    return next(
      new ApiError(`Your are not allowed to perform this action`, 403)
    );
  }

  await Review.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// @desc    Mark review as helpful
// @route   PUT /api/v1/reviews/:id/helpful
// @access  Private/Protect/User
exports.markReviewAsHelpful = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ApiError(`There is no review with id ${req.params.id}`, 404)
    );
  }

  review.helpful += 1;
  await review.save();

  res.status(200).json({
    status: "success",
    data: review,
  });
});

// @desc    Get reviews for a specific product
// @route   GET /api/v1/products/:productId/reviews
// @access  Public
exports.getProductReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate({ path: "user", select: "name" })
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: reviews,
  });
});

// @desc    Get user's reviews
// @route   GET /api/v1/reviews/myReviews
// @access  Private/Protect/User
exports.getUserReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate({ path: "product", select: "title imageCover" })
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: reviews,
  });
});
