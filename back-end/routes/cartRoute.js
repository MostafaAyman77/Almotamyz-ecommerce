const express = require('express');
const {
  addProductToCart,
  getUserCart,
  removeCartItem,
  clearCart,
  updateCartItemQuantity,
  getCartSummary,
} = require('../services/cartService');

const authService = require('../services/authService');
const {
  addProductToCartValidator,
  removeCartItemValidator,
  updateCartItemQuantityValidator,
} = require('../utils/validators/cartValidator');
const { userRole } = require('../enum');

const router = express.Router();

// All cart routes require authentication and user role
router.use(authService.protect, authService.allowedTo(userRole.user));

router
  .route('/')
  .post(addProductToCartValidator, addProductToCart)
  .get(getUserCart)
  .delete(clearCart);

router.get('/summary', getCartSummary);

router
  .route('/:itemId')
  .put(updateCartItemQuantityValidator, updateCartItemQuantity)
  .delete(removeCartItemValidator, removeCartItem);

module.exports = router;