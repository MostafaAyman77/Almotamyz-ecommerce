const express = require("express");

const {
  getBrands,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
  restoreBrand,
  getDeletedBrands
} = require("../services/brandService");

const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
  restoreBrandValidator,
} = require("../utils/validators/brandValidator");

const authService = require("../services/authService");
const { userRole } = require("../enum.js");

const router = express.Router();

// Public routes
router.route("/")
  .get(getBrands)
  .post(
    authService.protect,
    authService.allowedTo(userRole.admin),
    createBrandValidator,
    createBrand
  );

// Admin only - deleted brands management
router.get(
  "/deleted/all",
  authService.protect,
  authService.allowedTo(userRole.admin),
  getDeletedBrands
);

router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(
    authService.protect,
    authService.allowedTo(userRole.admin),
    updateBrandValidator,
    updateBrand
  )
  .delete(
    authService.protect,
    authService.allowedTo(userRole.admin),
    deleteBrandValidator,
    deleteBrand
  );

// Restore soft-deleted brand
router.patch(
  "/:id/restore",
  authService.protect,
  authService.allowedTo(userRole.admin),
  restoreBrandValidator,
  restoreBrand
);

module.exports = router;