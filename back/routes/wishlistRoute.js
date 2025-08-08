const express = require('express');

const {
    addProductToWishlist,
    removeProductFromWishlist,
    getLoggedUserWishlist,
    clearWishlist,
    checkProductInWishlist,
    moveProductToCart,
} = require('../services/wishlistService');

const authService = require('../services/authService');

const {
    addProductToWishlistValidator,
    removeProductFromWishlistValidator,
    checkProductInWishlistValidator,
    moveProductToCartValidator,
} = require('../utils/validators/wishlistValidator');

const router = express.Router();

router.use(authService.protect, authService.allowedTo('user'));

router
    .route('/')
    .post(addProductToWishlistValidator, addProductToWishlist)
    .get(getLoggedUserWishlist)
    .delete(clearWishlist);

router.get(
    '/check/:productId',
    checkProductInWishlistValidator,
    checkProductInWishlist
);

router.post(
    '/:productId/moveToCart',
    moveProductToCartValidator,
    moveProductToCart
);

router.delete(
    '/:productId',
    removeProductFromWishlistValidator,
    removeProductFromWishlist
);

module.exports = router;

