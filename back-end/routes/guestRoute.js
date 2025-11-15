// const express = require('express');

// const {
//     getLoggedUserCart,
//     addProductToCart,
//     removeSpecificCartItem,
//     clearCart,
//     updateCartItemQuantity,
//     applyCoupon,
// } = require('../services/cartService');

// const {
//     createCashOrder,
// } = require('../services/orderService');

// const {
//     addProductToCartValidator,
//     removeCartItemValidator,
//     updateCartItemQuantityValidator,
// } = require('../utils/validators/cartValidator');

// const {
//     createCashOrderValidator,
// } = require('../utils/validators/orderValidator');

// const router = express.Router();

// // Guest cart routes (no authentication required)
// router
//     .route('/cart')
//     .post(addProductToCartValidator, addProductToCart)
//     .get(getLoggedUserCart)
//     .delete(clearCart);

// router.put('/cart/applyCoupon', applyCoupon);

// router
//     .route('/cart/:itemId')
//     .put(updateCartItemQuantityValidator, updateCartItemQuantity)
//     .delete(removeCartItemValidator, removeSpecificCartItem);

// // Guest order routes (no authentication required)
// router.route('/orders/:cartId').post(
//     createCashOrderValidator,
//     createCashOrder
// );

// module.exports = router; 