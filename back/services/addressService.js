const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");
const ApiError = require("../utils/apiError");

// @desc    Add address to user addresses list
// @route   POST /api/v1/addresses
// @access  Private/User
exports.addAddress = asyncHandler(async (req, res, next) => {
  // $addToSet => add address object to user addresses  array if address not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address added successfully.",
    data: user.addresses,
  });
});

// @desc    Remove address from user addresses list
// @route   DELETE /api/v1/addresses/:addressId
// @access  Private/User
exports.removeAddress = asyncHandler(async (req, res, next) => {
  // $pull => remove address object from user addresses array if addressId exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address removed successfully.",
    data: user.addresses,
  });
});

// @desc    Get logged user addresses list
// @route   GET /api/v1/addresses
// @access  Private/User
exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("addresses");

  res.status(200).json({
    status: "success",
    results: user.addresses.length,
    data: user.addresses,
  });
});

// @desc    Update specific address
// @route   PUT /api/v1/addresses/:addressId
// @access  Private/User
exports.updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  const addressIndex = user.addresses.findIndex(
    (address) => address._id.toString() === req.params.addressId
  );

  if (addressIndex === -1) {
    return next(new ApiError("Address not found", 404));
  }

  // Update the address
  Object.keys(req.body).forEach((key) => {
    user.addresses[addressIndex][key] = req.body[key];
  });

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Address updated successfully.",
    data: user.addresses,
  });
});

// @desc    Get specific address
// @route   GET /api/v1/addresses/:addressId
// @access  Private/User
exports.getAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  const address = user.addresses.find(
    (addr) => addr._id.toString() === req.params.addressId
  );

  if (!address) {
    return next(new ApiError("Address not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: address,
  });
});
