const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");
const Product = require("../models/productModel");
const ApiError = require("../utils/apiError");
const db = require("./DB/db.services.js");

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist
// @access  Private/User
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  // Check if product exists and is not deleted
  const product = await db.findOne({
    model: Product,
    filter: { 
      _id: productId, 
      isDeleted: { $ne: true } 
    }
  });

  if (!product) {
    return next(new ApiError("Product not found or has been deleted", 404));
  }

  // Check if product is already in wishlist
  const user = await db.findOne({
    model: User,
    filter: { 
      _id: req.user._id,
      wishlist: productId 
    }
  });

  if (user) {
    return next(new ApiError("Product is already in your wishlist", 400));
  }

  // Add product to wishlist using $addToSet
  const updatedUser = await db.findByIdAndUpdate({
    model: User,
    id: req.user._id,
    data: {
      $addToSet: { wishlist: productId }
    }
  });

  res.status(200).json({
    status: "success",
    message: "Product added successfully to your wishlist.",
    data: updatedUser.wishlist,
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Private/User
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  // Remove product from wishlist using $pull
  const updatedUser = await db.findByIdAndUpdate({
    model: User,
    id: req.user._id,
    data: {
      $pull: { wishlist: productId }
    }
  });

  res.status(200).json({
    status: "success",
    message: "Product removed successfully from your wishlist.",
    data: updatedUser.wishlist,
  });
});

// @desc    Get logged user wishlist
// @route   GET /api/v1/wishlist
// @access  Private/User
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await db.findOne({
    model: User,
    filter: { _id: req.user._id },
    options: { populate: "wishlist" }
  });

  // Filter out any deleted products from the populated wishlist
  const filteredWishlist = user.wishlist.filter(product => 
    product && !product.isDeleted
  );

  res.status(200).json({
    status: "success",
    results: filteredWishlist.length,
    data: filteredWishlist,
  });
});

// @desc    Clear user wishlist
// @route   DELETE /api/v1/wishlist
// @access  Private/User
exports.clearWishlist = asyncHandler(async (req, res, next) => {
  const updatedUser = await db.findByIdAndUpdate({
    model: User,
    id: req.user._id,
    data: {
      wishlist: []
    }
  });

  res.status(200).json({
    status: "success",
    message: "Wishlist cleared successfully.",
    data: updatedUser.wishlist,
  });
});

// @desc    Check if product is in wishlist
// @route   GET /api/v1/wishlist/check/:productId
// @access  Private/User
exports.checkProductInWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const user = await db.findOne({
    model: User,
    filter: { 
      _id: req.user._id,
      wishlist: productId 
    }
  });

  const isInWishlist = !!user;

  res.status(200).json({
    status: "success",
    data: {
      productId,
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

  // 1. Check if product exists and is not deleted
  const product = await db.findOne({
    model: Product,
    filter: { 
      _id: productId, 
      isDeleted: { $ne: true } 
    }
  });

  if (!product) {
    return next(new ApiError("Product not found or has been deleted", 404));
  }

  // 2. Check if product is in wishlist
  const userWithProduct = await db.findOne({
    model: User,
    filter: { 
      _id: req.user._id,
      wishlist: productId 
    }
  });

  if (!userWithProduct) {
    return next(new ApiError("Product is not in your wishlist", 400));
  }

  // 3. Remove from wishlist
  const updatedUser = await db.findByIdAndUpdate({
    model: User,
    id: req.user._id,
    data: {
      $pull: { wishlist: productId }
    }
  });
});