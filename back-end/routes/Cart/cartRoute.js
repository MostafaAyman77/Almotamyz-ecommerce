const express = require("express");

const {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearCart,
  updateCartItemQuantity,
  applyCoupon,
} = require("./../../services/Cart/cartServices");

const authService = require("./../../services/authService");

const {
  addProductToCartValidator,
  removeCartItemValidator,
  updateCartItemQuantityValidator,
  applyCouponValidator,
} = require("./../../utils/validators/cart/cartValidator");

const router = express.Router();

// Apply authentication middleware to all cart routes
router.use(authService.protect, authService.allowedTo("user"));

router
  .route("/")
  .post(addProductToCartValidator, addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);

router.put("/applyCoupon", applyCouponValidator, applyCoupon);

router
  .route("/:itemId")
  .put(updateCartItemQuantityValidator, updateCartItemQuantity)
  .delete(removeCartItemValidator, removeSpecificCartItem);

module.exports = router;