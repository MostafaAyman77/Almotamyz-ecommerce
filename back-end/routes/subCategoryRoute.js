const express = require("express");

const {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
  restoreSubCategory,
  getDeletedSubCategories,
  getSubCategoriesByCategory,
  setCategoryIdBody,
  createFilterObject,
} = require("../services/subCategoryService");

const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
  restoreSubCategoryValidator,
  getSubCategoriesValidator,
  getDeletedSubCategoriesValidator,
  getSubCategoriesByCategoryValidator,
} = require("../utils/validators/subCategoryValidator");

const authService = require("../services/authService");
const { userRole } = require("../enum.js");

// mergeParams: Allow us to access parameters on other routers
const router = express.Router({ mergeParams: true });

// Nested route: /api/v1/categories/:categoryId/subcategories
router
  .route("/")
  .post(
    authService.protect,
    authService.allowedTo(userRole.admin),
    setCategoryIdBody,
    createSubCategoryValidator,
    createSubCategory
  )
  .get(
    getSubCategoriesValidator,
    createFilterObject,
    getSubCategories
  );

// Specific subcategory routes
router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .put(
    authService.protect,
    authService.allowedTo(userRole.admin),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    authService.protect,
    authService.allowedTo(userRole.admin),
    deleteSubCategoryValidator,
    deleteSubCategory
  );

// Soft delete functionality routes
router.patch(
  "/:id/restore",
  authService.protect,
  authService.allowedTo(userRole.admin),
  restoreSubCategoryValidator,
  restoreSubCategory
);

router.get(
  "/deleted/all",
  authService.protect,
  authService.allowedTo(userRole.admin),
  getDeletedSubCategoriesValidator,
  getDeletedSubCategories
);



module.exports = router;