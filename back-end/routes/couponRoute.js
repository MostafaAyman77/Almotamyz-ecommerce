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
} = require("../services/couponService");
const { protect, allowedTo } = require("../services/authService");
const { userRole } = require("../enum.js");

const router = express.Router();

// Protect all routes
// router.use(protect);

// Admin only routes
// router.use(allowedTo(userRole.admin));

router
  .route("/")
  .post(protect , allowedTo(userRole.admin),createCoupon)
  .get(protect , allowedTo(userRole.admin) ,getAllCoupons);

router
  .route("/my-coupons")
  .get(protect , allowedTo(userRole.admin),getMyCoupons);

router
  .route("/:id")
  .get(protect , allowedTo(userRole.admin),getCoupon)
  .patch(protect , allowedTo(userRole.admin) ,updateCoupon)
  .delete(protect , allowedTo(userRole.admin) , deleteCoupon);

router.patch("/:id/toggle-active", protect , allowedTo(userRole.admin),toggleCouponActive);
router.post("/:id/apply", protect , allowedTo(userRole.user) ,applyCoupon);

// Public validation route (protected but not admin restricted)
router.post("/validate", protect , allowedTo(userRole.user),validateCoupon);

module.exports = router;