const asyncHandler = require('express-async-handler');
const db = require('./DB/db.services');
const ApiError = require('../utils/apiError');
const Coupon = require('../models/couponModel');

// @desc    Get list of coupons
// @route   GET /api/v1/coupons
// @access  Private/Admin-Manager
exports.getCoupons = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  
  // Build sort object
  const sortObj = {};
  if (sort) {
    const sortFields = sort.split(',');
    sortFields.forEach(field => {
      if (field.startsWith('-')) {
        sortObj[field.slice(1)] = -1;
      } else {
        sortObj[field] = 1;
      }
    });
  }

  const result = await db.findWithPagination({
    model: Coupon,
    filter: {},
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortObj
  });

  res.status(200).json({
    status: 'success',
    results: result.data.length,
    pagination: result.pagination,
    data: result.data,
  });
});

// @desc    Get specific coupon by id
// @route   GET /api/v1/coupons/:id
// @access  Private/Admin-Manager
exports.getCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const coupon = await db.findOne({
    model: Coupon,
    filter: { _id: id },
    options: { lean: true }
  });

  if (!coupon) {
    return next(new ApiError(`No coupon found with id: ${id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: coupon,
  });
});

// @desc    Create coupon
// @route   POST  /api/v1/coupons
// @access  Private/Admin-Manager
exports.createCoupon = asyncHandler(async (req, res, next) => {
  // Add the user who created the coupon
  req.body.createdBy = req.user._id;
  
  // Convert name to uppercase
  if (req.body.name) {
    req.body.name = req.body.name.toUpperCase();
  }

  // Check if coupon with same name already exists
  const existingCoupon = await db.findOne({
    model: Coupon,
    filter: { name: req.body.name }
  });

  if (existingCoupon) {
    return next(new ApiError('Coupon with this name already exists', 400));
  }

  const coupon = await db.create({
    model: Coupon,
    data: req.body
  });

  res.status(201).json({
    status: 'success',
    data: coupon,
  });
});

// @desc    Update specific coupon
// @route   PUT /api/v1/coupons/:id
// @access  Private/Admin-Manager
exports.updateCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if coupon exists
  const existingCoupon = await db.findOne({
    model: Coupon,
    filter: { _id: id }
  });

  if (!existingCoupon) {
    return next(new ApiError(`No coupon found with id: ${id}`, 404));
  }

  // Convert name to uppercase if provided
  if (req.body.name) {
    req.body.name = req.body.name.toUpperCase();
    
    // Check if another coupon with same name exists (excluding current coupon)
    const duplicateCoupon = await db.findOne({
      model: Coupon,
      filter: { name: req.body.name, _id: { $ne: id } }
    });

    if (duplicateCoupon) {
      return next(new ApiError('Coupon with this name already exists', 400));
    }
  }

  const updatedCoupon = await db.findByIdAndUpdate({
    model: Coupon,
    id: id,
    data: req.body
  });

  res.status(200).json({
    status: 'success',
    data: updatedCoupon,
  });
});

// @desc    Delete specific coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Private/Admin-Manager
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await db.findOne({
    model: Coupon,
    filter: { _id: id }
  });

  if (!coupon) {
    return next(new ApiError(`No coupon found with id: ${id}`, 404));
  }

  await db.findByIdAndDelete({
    model: Coupon,
    id: id
  });

  res.status(204).send();
});

// @desc    Validate coupon
// @route   POST /api/v1/coupons/validate
// @access  Private/User
exports.validateCoupon = asyncHandler(async (req, res, next) => {
  const { couponName, orderAmount, productIds = [] } = req.body;

  const coupon = await db.findOne({
    model: Coupon,
    filter: { name: couponName.toUpperCase() }
  });

  if (!coupon) {
    return next(new ApiError('Coupon not found', 404));
  }

  if (!coupon.isValid()) {
    return next(new ApiError('Coupon is invalid or expired', 400));
  }

  if (orderAmount < coupon.minOrderAmount) {
    return next(
      new ApiError(
        `Minimum order amount should be ${coupon.minOrderAmount}`,
        400
      )
    );
  }

  // Check if coupon is applicable to specific products
  if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
    if (productIds.length === 0) {
      return next(new ApiError('This coupon is only applicable to specific products', 400));
    }
    
    const hasApplicableProduct = productIds.some(productId => 
      coupon.applicableProducts.includes(productId)
    );
    
    if (!hasApplicableProduct) {
      return next(new ApiError('This coupon is not applicable to the selected products', 400));
    }
  }

  let discountAmount = (orderAmount * coupon.discount) / 100;
  
  if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
    discountAmount = coupon.maxDiscountAmount;
  }

  const finalAmount = orderAmount - discountAmount;

  res.status(200).json({
    status: 'success',
    data: {
      coupon: {
        id: coupon._id,
        name: coupon.name,
        discount: coupon.discount,
        discountAmount,
        finalAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
        minOrderAmount: coupon.minOrderAmount,
      },
    },
  });
});

// @desc    Get active coupons
// @route   GET /api/v1/coupons/active
// @access  Public
exports.getActiveCoupons = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  const filter = {
    isActive: true,
    expire: { $gt: new Date() },
    $or: [
      { maxUses: null },
      { $expr: { $lt: ['$usedCount', '$maxUses'] } }
    ]
  };

  const result = await db.findWithPagination({
    model: Coupon,
    filter: filter,
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    select: 'name discount expire minOrderAmount maxDiscountAmount maxUses usedCount'
  });

  res.status(200).json({
    status: 'success',
    results: result.data.length,
    pagination: result.pagination,
    data: result.data,
  });
});

// @desc    Increment coupon usage
// @route   PUT /api/v1/coupons/:id/increment-usage
// @access  Private/Admin-Manager
exports.incrementCouponUsage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await db.findOne({
    model: Coupon,
    filter: { _id: id }
  });

  if (!coupon) {
    return next(new ApiError(`No coupon found with id: ${id}`, 404));
  }

  if (!coupon.isValid()) {
    return next(new ApiError('Cannot use expired or inactive coupon', 400));
  }

  const updatedCoupon = await db.findByIdAndUpdate({
    model: Coupon,
    id: id,
    data: { $inc: { usedCount: 1 } }
  });

  res.status(200).json({
    status: 'success',
    data: updatedCoupon,
  });
});

// @desc    Toggle coupon status
// @route   PUT /api/v1/coupons/:id/toggle-status
// @access  Private/Admin-Manager
exports.toggleCouponStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await db.findOne({
    model: Coupon,
    filter: { _id: id }
  });

  if (!coupon) {
    return next(new ApiError(`No coupon found with id: ${id}`, 404));
  }

  const updatedCoupon = await db.findByIdAndUpdate({
    model: Coupon,
    id: id,
    data: { isActive: !coupon.isActive }
  });

  res.status(200).json({
    status: 'success',
    data: updatedCoupon,
  });
});