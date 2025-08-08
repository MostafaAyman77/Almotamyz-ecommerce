const express = require("express");

const {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdBody,
  createFilterObject,
} = require("../services/subCategoryService");
const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require("../utils/validators/subCategoryValidator ");

// mergeParams: Allow us to access parameters on other routers
// ex: we need to access categoryId from category router
const router = express.Router({ mergeParams: true });
const authService = require("../services/authService");

router
  .route("/")
  .post(
    authService.protect,
    authService.allowedTo("admin"),
    setCategoryIdBody,
    createSubCategoryValidator,
    createSubCategory
  )
  .get(createFilterObject, getSubCategories);

router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .put(
    authService.protect,
    authService.allowedTo("admin"),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteSubCategoryValidator,
    deleteSubCategory
  );

router
  .route("/:categoryId/subcategories")
  .get(getSubCategoryValidator, getSubCategory);
module.exports = router;
