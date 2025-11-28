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
const { userRole } = require('../enum.js');

const router = express.Router();

router.use(authService.protect, authService.allowedTo(userRole.user));

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

router.delete(
    '/:productId',
    removeProductFromWishlistValidator,
    removeProductFromWishlist
);

module.exports = router;

