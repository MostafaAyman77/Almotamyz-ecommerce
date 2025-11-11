const express = require("express");

const {
  getReview,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setProductIdAndUserIdToBody,
  markReviewAsHelpful,
  getProductReviews,
  getUserReviews,
  getReviewStats,
} = require("../services/reviewService");

const {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
  productReviewsValidator,
  markHelpfulValidator,
  reviewStatsValidator,
  queryParamsValidator,
} = require("../utils/validators/reviewValidator");

const authService = require("../services/authService");
const { userRole } = require("../enum.js");

const router = express.Router({ mergeParams: true });

// Public routes
router.get("/", queryParamsValidator, createFilterObj, getReviews);
router.get("/:id", getReviewValidator, getReview);

// Product reviews routes
router.get(
  "/products/:productId/reviews", 
  productReviewsValidator, 
  queryParamsValidator, 
  getProductReviews
);

// Protected routes
router.use(authService.protect);

// Create review
router.post(
  "/",
  authService.allowedTo(userRole.user),
  setProductIdAndUserIdToBody,
  createReviewValidator,
  createReview
);

// User routes
router.get(
  "/my/reviews", 
  authService.allowedTo(userRole.user), 
  queryParamsValidator, 
  getUserReviews
);

router.put(
  "/:id/helpful",
  authService.allowedTo(userRole.user),
  markHelpfulValidator,
  markReviewAsHelpful
);

// Review management routes
router
  .route("/:id")
  .put(
    authService.allowedTo(userRole.user), 
    updateReviewValidator, 
    updateReview
  )
  .delete(
    authService.allowedTo(userRole.user , userRole.admin , userRole.manager),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;