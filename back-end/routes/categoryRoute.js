const express = require("express");
const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
  getDeletedCategories,
} = require("../services/categoryService");
const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
  getCategoriesValidator,
  getDeletedCategoriesValidator,
} = require("../utils/validators/categoryValidator");

const subcategoriesRoute = require("./subCategoryRoute");
const authService = require("../services/authService");
const { userRole } = require("../enum.js");

const router = express.Router();

router
  .route("/")
  .get(
    getCategoriesValidator,
    getCategories
  )
  .post(
    authService.protect,
    authService.allowedTo(userRole.admin),
    createCategoryValidator,
    createCategory
  );

router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    authService.protect,
    authService.allowedTo(userRole.admin),
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    authService.protect,
    authService.allowedTo(userRole.admin),
    deleteCategoryValidator,
    deleteCategory
  );

// New routes for soft delete functionality
router.patch(
  "/:id/restore",
  authService.protect,
  authService.allowedTo(userRole.admin),
  getCategoryValidator,
  restoreCategory
);

router.get(
  "/deleted/all",
  authService.protect,
  authService.allowedTo(userRole.admin),
  getDeletedCategoriesValidator,
  getDeletedCategories
);

router.use("/:categoryId/subcategories", subcategoriesRoute);

module.exports = router;