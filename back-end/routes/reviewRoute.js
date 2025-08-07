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
} = require("../services/reviewService");

const {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validators/reviewValidator");

const authService = require("../services/authService");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(createFilterObj, getReviews)
  .post(
    authService.protect,
    authService.allowedTo("user"),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview
  );

// Protected routes
router.use(authService.protect);

// User routes
router.get("/myReviews", authService.allowedTo("user"), getUserReviews);

router.put(
  "/:id/helpful",
  authService.allowedTo("user"),
  getReviewValidator,
  markReviewAsHelpful
);

router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(authService.allowedTo("user"), updateReviewValidator, updateReview)
  .delete(
    authService.allowedTo("user", "manager", "admin"),
    deleteReviewValidator,
    deleteReview
  );
module.exports = router;
