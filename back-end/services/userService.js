const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const factory = require("./handlersFactory");
const createToken = require("../utils/createToken");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
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

// @desc    Get list of users
// @route   GET /api/v1/users
// @access  Private/Admin-Manager
exports.getUsers = factory.getAll(User);

// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private/Admin-Manager
exports.getUser = factory.getOne(User);

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin-Manager
exports.createUser = factory.createOne(User);

// @desc    Update specific user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin-Manager
exports.updateUser = factory.updateOne(User);

// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin-Manager
exports.deleteUser = factory.deleteOne(User);

// @desc    Upload user image
// @route   POST /api/v1/users
// @access  Private/Admin-Manager
exports.uploadUserImage = uploadSingleImage("image");

// @desc    Image processing
// @route   POST /api/v1/users
// @access  Private/Admin-Manager
exports.resizeImage = asyncHandler(async (req, res, next) => {
  // For now, just pass through - resize functionality can be added later
  next();
});

// @desc    Change user password
// @route   PUT /api/v1/users/changePassword/:id
// @access  Private/Admin-Manager
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc    Get logged user data
// @route   GET /api/v1/users/getMe
// @access  Private/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc    Update logged user password
// @route   PUT /api/v1/users/changeMyPassword
// @access  Private/Protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1) Update user password based user payload (req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  // 2) Generate token
  const token = createToken(user._id);

  res.status(200).json({ data: user, token });
});

// @desc    Update logged user data (without password, role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );

  res.status(200).json({ data: updatedUser });
});

// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/Protect
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: "Success" });
});
