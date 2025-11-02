const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');

const ApiError = require('../utils/apiError');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const createToken = require('../utils/createToken');
const User = require('../models/userModel');
const dbService = require('../services/DB/db.services');
const { userRole } = require('../enum');

// Upload single image
exports.uploadUserImage = uploadSingleImage('profileImg');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    req.body.profileImg = filename;
  }
  next();
});

// @desc    Get list of users with pagination and filters
// @route   GET /api/v1/users
// @access  Private/Admin-Manager
exports.getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const keyword = req.query.keyword || '';
  const role = req.query.role;
  const active = req.query.active;
  const isVerified = req.query.isVerified;

  // Build filter
  const filter = {};

  if (keyword) {
    filter.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } }
    ];
  }

  if (role && Object.values(userRole).includes(role)) {
    filter.role = role;
  }

  if (active !== undefined) {
    filter.active = active === 'true';
  }

  if (isVerified !== undefined) {
    filter.isVerified = isVerified === 'true';
  }

  const sort = { createdAt: -1 };
  const select = '-password -passwordResetCode -passwordResetExpires -emailVerifyToken';

  const result = await dbService.findWithPagination({
    model: User,
    filter,
    page,
    limit,
    sort,
    select
  });

  res.status(200).json({
    status: 'success',
    results: result.data.length,
    pagination: result.pagination,
    data: result.data
  });
});

// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private/Admin-Manager
exports.getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await dbService.findById({
    model: User,
    id,
    projection: '-password -passwordResetCode -passwordResetExpires -emailVerifyToken'
  });

  if (!user) {
    return next(new ApiError(`No user found for id: ${id}`, 404));
  }

  res.status(200).json({ status: 'success', data: user });
});

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin-Manager
exports.createUser = asyncHandler(async (req, res) => {
  const userData = {
    name: req.body.name,
    slug: req.body.slug,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role || userRole.user,
    active: req.body.active !== undefined ? req.body.active : true,
    isVerified: req.body.isVerified !== undefined ? req.body.isVerified : false,
  };

  const user = await dbService.create({
    model: User,
    data: userData
  });

  // Remove sensitive fields from response
  user.password = undefined;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.emailVerifyToken = undefined;

  res.status(201).json({ status: 'success', data: user });
});

// @desc    Update specific user (without password)
// @route   PUT /api/v1/users/:id
// @access  Private/Admin-Manager
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const updateData = {};

  // Only include fields that are provided and allowed to update
  const allowedFields = ['name', 'slug', 'email', 'role', 'active', 'isVerified'];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const user = await dbService.findByIdAndUpdate({
    model: User,
    id,
    data: updateData
  });

  if (!user) {
    return next(new ApiError(`No user found for id: ${id}`, 404));
  }

  // Remove sensitive fields from response
  user.password = undefined;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.emailVerifyToken = undefined;

  res.status(200).json({ status: 'success', data: user });
});

// @desc    Change user password (Admin)
// @route   PUT /api/v1/users/changePassword/:id
// @access  Private/Admin-Manager
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // First verify current password
  const user = await dbService.findById({ model: User, id });

  if (!user) {
    return next(new ApiError(`No user found for id: ${id}`, 404));
  }

  const isCorrectPassword = await bcrypt.compare(
    req.body.currentPassword,
    user.password
  );

  if (!isCorrectPassword) {
    return next(new ApiError('Current password is incorrect', 401));
  }

  // Update password
  const hashedPassword = await bcrypt.hash(req.body.password, 12);

  const updatedUser = await dbService.findByIdAndUpdate({
    model: User,
    id,
    data: {
      password: hashedPassword,
      passwordChangedAt: Date.now()
    }
  });

  updatedUser.password = undefined;

  res.status(200).json({ status: 'success', data: updatedUser });
});

// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin-Manager
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await dbService.findByIdAndDelete({
    model: User,
    id
  });

  if (!user) {
    return next(new ApiError(`No user found for id: ${id}`, 404));
  }

  res.status(204).json({ status: 'success' });
});

// @desc    Deactivate user
// @route   PUT /api/v1/users/deactivate/:id
// @access  Private/Admin-Manager
exports.deactivateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await dbService.findByIdAndUpdate({
    model: User,
    id,
    data: { active: false }
  });

  if (!user) {
    return next(new ApiError(`No user found for id: ${id}`, 404));
  }

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    message: 'User deactivated successfully',
    data: user
  });
});

// @desc    Activate user
// @route   PUT /api/v1/users/activate/:id
// @access  Private/Admin-Manager
exports.activateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await dbService.findByIdAndUpdate({
    model: User,
    id,
    data: { active: true }
  });

  if (!user) {
    return next(new ApiError(`No user found for id: ${id}`, 404));
  }

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    message: 'User activated successfully',
    data: user
  });
});

// @desc    Verify user email
// @route   PUT /api/v1/users/verify/:id
// @access  Private/Admin-Manager
exports.verifyUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await dbService.findByIdAndUpdate({
    model: User,
    id,
    data: {
      isVerified: true,
      emailVerifyToken: undefined
    }
  });

  if (!user) {
    return next(new ApiError(`No user found for id: ${id}`, 404));
  }

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    message: 'User verified successfully',
    data: user
  });
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
  // Verify current password
  const user = await dbService.findById({
    model: User,
    id: req.user._id
  });

  const isCorrectPassword = await bcrypt.compare(
    req.body.currentPassword,
    user.password
  );

  if (!isCorrectPassword) {
    return next(new ApiError('Current password is incorrect', 401));
  }

  // Update password
  const hashedPassword = await bcrypt.hash(req.body.password, 12);

  const updatedUser = await dbService.findByIdAndUpdate({
    model: User,
    id: req.user._id,
    data: {
      password: hashedPassword,
      passwordChangedAt: Date.now()
    }
  });

  // Generate new token
  const token = createToken.generateAuthTokens(updatedUser)

  updatedUser.password = undefined;

  res.status(200).json({
    status: 'success',
    data: updatedUser,
    token
  });
});

// @desc    Update logged user data (without password, role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updateData = {};

  // Only allow specific fields
  const allowedFields = ['name', 'slug', 'email'];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const updatedUser = await dbService.findByIdAndUpdate({
    model: User,
    id: req.user._id,
    data: updateData
  });

  updatedUser.password = undefined;

  res.status(200).json({ status: 'success', data: updatedUser });
});

// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/Protect
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await dbService.findByIdAndUpdate({
    model: User,
    id: req.user._id,
    data: { active: false }
  });

  res.status(204).json({ status: 'success', data: updatedUser });
});

// @desc    Add address to user addresses
// @route   POST /api/v1/users/addresses
// @access  Private/Protect
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body }
    },
    { new: true }
  );

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    message: 'Address added successfully',
    data: user.addresses
  });
});

// @desc    Remove address from user addresses
// @route   DELETE /api/v1/users/addresses/:addressId
// @access  Private/Protect
exports.removeAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } }
    },
    { new: true }
  );

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    message: 'Address removed successfully',
    data: user.addresses
  });
});

// @desc    Get logged user addresses
// @route   GET /api/v1/users/addresses
// @access  Private/Protect
exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await dbService.findById({
    model: User,
    id: req.user._id,
    projection: 'addresses'
  });

  res.status(200).json({
    status: 'success',
    results: user.addresses.length,
    data: user.addresses
  });
});

// @desc    Get users count by role
// @route   GET /api/v1/users/stats/roles
// @access  Private/Admin-Manager
exports.getUsersStatsByRole = asyncHandler(async (req, res) => {
  const stats = await dbService.aggregate({
    model: User,
    pipeline: [
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    data: stats
  });
});

// @desc    Get active/inactive users count
// @route   GET /api/v1/users/stats/active
// @access  Private/Admin-Manager
exports.getActiveUsersCount = asyncHandler(async (req, res) => {
  const activeCount = await dbService.countDocuments({
    model: User,
    filter: { active: true }
  });

  const inactiveCount = await dbService.countDocuments({
    model: User,
    filter: { active: false }
  });

  res.status(200).json({
    status: 'success',
    data: {
      active: activeCount,
      inactive: inactiveCount,
      total: activeCount + inactiveCount
    }
  });
});

// @desc    Get verified/unverified users count
// @route   GET /api/v1/users/stats/verified
// @access  Private/Admin-Manager
exports.getVerifiedUsersCount = asyncHandler(async (req, res) => {
  const verifiedCount = await dbService.countDocuments({
    model: User,
    filter: { isVerified: true }
  });

  const unverifiedCount = await dbService.countDocuments({
    model: User,
    filter: { isVerified: false }
  });

  res.status(200).json({
    status: 'success',
    data: {
      verified: verifiedCount,
      unverified: unverifiedCount,
      total: verifiedCount + unverifiedCount
    }
  });
});