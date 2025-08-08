const express = require("express");

const {
  getCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getActiveCoupons,
} = require("../services/couponService");

const authService = require("../services/authService");

const {
  getCouponValidator,
  createCouponValidator,
  updateCouponValidator,
  deleteCouponValidator,
  validateCouponValidator,
} = require("../utils/validators/couponValidator");

const router = express.Router();

// ===== Public Routes =====
router.get("/active", getActiveCoupons);

router.post("/validate", validateCouponValidator, validateCoupon);

router.use(authService.protect);

router.use(authService.allowedTo("admin", "manager"));

router.route("/").get(getCoupons).post(createCouponValidator, createCoupon);

router
  .route("/:id")
  .get(getCouponValidator, getCoupon)
  .put(updateCouponValidator, updateCoupon)
  .delete(deleteCouponValidator, deleteCoupon);

module.exports = router;
