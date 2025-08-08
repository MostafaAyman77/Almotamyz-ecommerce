const express = require("express");

const { getCategories,createCategory,getCategory,updateCategory,deleteCategory } = require("../services/categoryService");
const { getCategoryValidator,createCategoryValidator,updateCategoryValidator,deleteCategoryValidator } = require("../utils/validators/categoryValidator");
const subcategoriesRoute = require("./subCategoryRoute")


const router = express.Router();

router.route("/")
    .get(getCategories)
    .post(createCategoryValidator, createCategory);

    router
    .route("/:id")
    .get(getCategoryValidator, getCategory)
    .put(updateCategoryValidator, updateCategory)
    .delete(deleteCategoryValidator, deleteCategory); 

router.use("/:categoryId/subcategories", subcategoriesRoute);


module.exports = router;