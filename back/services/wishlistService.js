const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");
const Product = require("../models/productModel");
const ApiError = require("../utils/apiError");
const { addProductToUserCart } = require("./cartService");

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist
// @access  Private/User
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  // $addToSet => add productId to wishlist array if productId not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Product added successfully to your wishlist.",
    data: user.wishlist,
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Private/User
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  // $pull => remove productId from wishlist array if productId exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Product removed successfully from your wishlist.",
    data: user.wishlist,
  });
});

// @desc    Get logged user wishlist
// @route   GET /api/v1/wishlist
// @access  Private/User
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("wishlist");

  res.status(200).json({
    status: "success",
    results: user.wishlist.length,
    data: user.wishlist,
  });
});

// @desc    Clear user wishlist
// @route   DELETE /api/v1/wishlist
// @access  Private/User
exports.clearWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { wishlist: 1 },
    },
    { new: true }
  );

  // Set wishlist to empty array
  user.wishlist = [];
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Wishlist cleared successfully.",
    data: user.wishlist,
  });
});

// @desc    Check if product is in wishlist
// @route   GET /api/v1/wishlist/check/:productId
// @access  Private/User
exports.checkProductInWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const isInWishlist = user.wishlist.includes(req.params.productId);

  res.status(200).json({
    status: "success",
    data: {
      productId: req.params.productId,
      isInWishlist,
    },
  });
});

// @desc    Move product from wishlist to cart
// @route   POST /api/v1/wishlist/:productId/moveToCart
// @access  Private/User
exports.moveProductToCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { color } = req.body;

  // 1. Remove from wishlist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: productId },
    },
    { new: true }
  );

  // 2. Add to cart
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  await addProductToUserCart(req.user._id, productId, color, product.price);

  res.status(200).json({
    status: "success",
    message: "Product moved from wishlist to cart successfully.",
    data: user.wishlist,
  });
});
