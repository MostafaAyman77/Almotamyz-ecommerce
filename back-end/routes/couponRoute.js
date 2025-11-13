const express = require("express");
const {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  toggleCouponActive,
  getMyCoupons,
  applyCoupon,
  restoreCoupon,
} = require("../services/couponService");
const { protect, allowedTo } = require("../services/authService");
const { userRole } = require("../enum.js");
const {
  createCouponValidator,
  getCouponValidator,
  updateCouponValidator,
  deleteCouponValidator,
  validateApplyCouponValidator,
  applyCouponWithIdValidator,
  toggleCouponActiveValidator,
  paginationValidator,
} = require("./../utils/validators/couponValidator");

const router = express.Router();

// Public validation route (protected but not admin restricted)
router.post(
  "/validate",
  protect,
  allowedTo(userRole.user),
  validateApplyCouponValidator,
  validateCoupon
);

// Get coupons created by current admin
router.get(
  "/my-coupons",
  protect,
  allowedTo(userRole.admin),
  paginationValidator,
  getMyCoupons
);

// Main coupon routes
router
  .route("/")
  .post(
    protect,
    allowedTo(userRole.admin),
    createCouponValidator,
    createCoupon
  )
  .get(
    protect,
    allowedTo(userRole.admin),
    paginationValidator,
    getAllCoupons
  );

// Coupon by ID routes
router
  .route("/:id")
  .get(
    protect,
    allowedTo(userRole.admin),
    getCouponValidator,
    getCoupon
  )
  .patch(
    protect,
    allowedTo(userRole.admin),
    updateCouponValidator,
    updateCoupon
  )
  .delete(
    protect,
    allowedTo(userRole.admin),
    deleteCouponValidator,
    deleteCoupon
  );

// Restore soft deleted coupon
router.patch(
  "/:id/restore",
  protect,
  allowedTo(userRole.admin),
  getCouponValidator,
  restoreCoupon
);
// Toggle coupon active status
router.patch(
  "/:id/toggle-active",
  protect,
  allowedTo(userRole.admin),
  toggleCouponActiveValidator,
  toggleCouponActive
);

// Apply coupon (increments usage)
router.post(
  "/:id/apply",
  protect,
  allowedTo(userRole.user),
  applyCouponWithIdValidator,
  applyCoupon
);

module.exports = router;