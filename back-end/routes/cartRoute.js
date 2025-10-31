const express = require('express');

const {
    addProductToCart,
    getLoggedUserCart,
    removeSpecificCartItem,
    clearCart,
    updateCartItemQuantity,
    applyCoupon,
} = require('../services/cartService');

const authService = require('../services/authService');

const {
    addProductToCartValidator,
    removeCartItemValidator,
    updateCartItemQuantityValidator,
} = require('../utils/validators/cartValidator');

const router = express.Router();

// Cart routes are now public (support both authenticated users and guests)
// Authentication is handled within the service functions
router.use(authService.protect , authService.allowedTo('user'));
router
    .route('/')
    .post(addProductToCartValidator, addProductToCart)
    .get(getLoggedUserCart)
    .delete(clearCart);

router.put('/applyCoupon', applyCoupon);

router
    .route('/:itemId')
    .put(updateCartItemQuantityValidator, updateCartItemQuantity)
    .delete(removeCartItemValidator, removeSpecificCartItem);

module.exports = router;

