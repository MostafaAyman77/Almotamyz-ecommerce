const express = require("express");

const reviewRoute = require("./reviewRoute");
const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsBySubCategory,
} = require("../services/productService");
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");

const authService = require("../services/authService");

const router = express.Router();

router.use("/:productId/reviews", reviewRoute);

router
  .route("/")
  .get(getProducts)
  .post(
    authService.protect,
    authService.allowedTo("admin"),
    createProductValidator,
    createProduct
  );

router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    authService.protect,
    authService.allowedTo("admin"),
    updateProductValidator,
    updateProduct
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteProductValidator,
    deleteProduct
  );

router.get("/subcategory/:subCategoryId", getProductsBySubCategory);

module.exports = router;
