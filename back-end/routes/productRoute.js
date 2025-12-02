const express = require("express");

const reviewRoute = require("./reviewRoute");
const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsBySubCategory,
  restoreProduct,
  getDeletedProducts,
  uploadProductImages,
  resizeProductImages,
  addProductImages,
  deleteProductImages,
  getProductImages
} = require("../services/productService");
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
  restoreProductValidator,
  getProductsValidator,
  getDeletedProductsValidator,
} = require("../utils/validators/productValidator");

const authService = require("../services/authService");
const { userRole } = require("../enum.js");

const router = express.Router();

router.use("/:productId/reviews", reviewRoute);

router
  .route("/")
  .get(getProductsValidator,getProducts)
  .post(
    authService.protect,
    authService.allowedTo(userRole.admin),
    // uploadProductImages,
    // resizeProductImages,
    createProductValidator,
    createProduct
  );

router.get("/deleted", 
  authService.protect,
  authService.allowedTo(userRole.admin),
  getDeletedProductsValidator,
  getDeletedProducts
);

router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    authService.protect,
    authService.allowedTo(userRole.admin),
    // uploadProductImages,
    // resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    authService.protect,
    authService.allowedTo(userRole.admin),
    deleteProductValidator,
    deleteProduct
  );

router.patch("/:id/restore",
  authService.protect,
  authService.allowedTo(userRole.admin),
  restoreProductValidator,
  restoreProduct
);

// Product images routes
router.get('/:id/images', getProductImages);

router.patch(
  '/:id/images',
  authService.protect,
  authService.allowedTo(userRole.admin),
  uploadProductImages,
  resizeProductImages,
  addProductImages
);

router.delete(
  '/:id/images',
  authService.protect,
  authService.allowedTo(userRole.admin),
  deleteProductImages
);

router.get("/subcategory/:subCategoryId", getProductsBySubCategory);

module.exports = router;