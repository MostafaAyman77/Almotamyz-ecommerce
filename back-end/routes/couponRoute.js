const express = require("express");

const {
  getCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getActiveCoupons,
  incrementCouponUsage,
  toggleCouponStatus,
} = require("../services/couponService");

const authService = require("../services/authService");

const {
  getCouponValidator,
  createCouponValidator,
  updateCouponValidator,
  deleteCouponValidator,
  validateCouponValidator,
  incrementUsageValidator,
  toggleStatusValidator,
  queryParamsValidator,
} = require("../utils/validators/couponValidator");
const { userRole } = require("../enum.js");

const router = express.Router();

// ===== Public Routes =====
router.get("/active", queryParamsValidator, getActiveCoupons);
router.post("/validate", validateCouponValidator, validateCoupon);

// ===== Protected Routes =====
router.use(authService.protect);

// Admin/Manager routes
router.use(authService.allowedTo(userRole.admin, userRole.manager));

router.route("/")
  .get(queryParamsValidator, getCoupons)
  .post(createCouponValidator, createCoupon);

router.route("/:id")
  .get(getCouponValidator, getCoupon)
  .put(updateCouponValidator, updateCoupon)
  .delete(deleteCouponValidator, deleteCoupon);

// Additional coupon management routes
router.put("/:id/increment-usage", incrementUsageValidator, incrementCouponUsage);
router.put("/:id/toggle-status", toggleStatusValidator, toggleCouponStatus);

module.exports = router;