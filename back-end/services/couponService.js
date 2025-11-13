const Coupon = require("../models/couponModel");
const ApiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");
const {
  create,
  findOne,
  findById,
  update,
  findByIdAndUpdate,
  findByIdAndDelete,
  findWithPagination,
  softDelete,
  findNonDeleted,
} = require("./DB/db.services");

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = asyncHandler(async (req, res, next) => {
  const {
    name,
    expire,
    discountType,
    discount,
    maxUses,
    minOrderAmount,
    maxDiscountAmount,
  } = req.body;

  const coupon = await create({
    model: Coupon,
    data: {
      name: name.toUpperCase(),
      expire,
      discountType: discountType || 'percentage',
      discount,
      maxUses: maxUses || null,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      createdBy: req.user._id,
    }
  });

  const populatedCoupon = await findById({
    model: Coupon,
    id: coupon._id
  });

  res.status(201).json({
    status: "success",
    data: {
      coupon: populatedCoupon.toPublicJSON(),
    },
  });
});

// @desc    Get all coupons with pagination
// @route   GET /api/coupons
// @access  Private/Admin
exports.getAllCoupons = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort || { createdAt: -1 };

  const result = await findWithPagination({
    model: Coupon,
    filter : { isDeleted: { $ne: true } },
    page,
    limit,
    sort,
    select: "-__v"
  });

  const populatedCoupons = await Promise.all(
    result.data.map(async (coupon) => {
      return await findById({
        model: Coupon,
        id: coupon._id
      });
    })
  );

  res.status(200).json({
    status: "success",
    results: result.pagination.totalCount,
    pagination: result.pagination,
    data: {
      coupons: populatedCoupons.map(coupon => coupon.toPublicJSON()),
    },
  });
});

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
exports.getCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await findNonDeleted({
    model: Coupon,
    filter: {id: req.params.id}
  });

  if (!coupon) {
    return next(new ApiError("Coupon not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      coupon: coupon.toPublicJSON(),
    },
  });
});

// @desc    Update coupon
// @route   PATCH /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = asyncHandler(async (req, res, next) => {
  const { name, ...updateData } = req.body;

  if (name) {
    updateData.name = name.toUpperCase();
  }

  const coupon = await findByIdAndUpdate({
    model: Coupon,
    id: req.params.id,
    data: updateData,
    options: { new: true, runValidators: true }
  });

  if (!coupon || coupon.isDeleted) {
    return next(new ApiError("Coupon not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      coupon: coupon.toPublicJSON(),
    },
  });
});

// @desc    Delete coupon (soft delete)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await softDelete({
    model: Coupon,
    filter: { _id: req.params.id }
  });

  if (!coupon) {
    return next(new ApiError("Coupon not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Private
exports.validateCoupon = asyncHandler(async (req, res, next) => {
  const { couponName, totalAmount } = req.body;

  const coupon = await findOne({
    model: Coupon,
    filter: { name: couponName.toUpperCase(), isDeleted: false }
  });

  if (!coupon) {
    return next(new ApiError("Invalid coupon", 400));
  }

  if (!coupon.isValid()) {
    return next(new ApiError("Coupon is expired, inactive, or fully used", 400));
  }

  if (totalAmount < coupon.minOrderAmount) {
    return next(
      new ApiError(
        `Minimum order amount for this coupon is ${coupon.minOrderAmount}`,
        400
      )
    );
  }

  // Calculate discount using model method
  const discountAmount = coupon.calculateDiscount(totalAmount);
  const finalAmount = totalAmount - discountAmount;

  res.status(200).json({
    status: "success",
    data: {
      isValid: true,
      coupon: coupon.toPublicJSON(),
      discountAmount,
      finalAmount,
      originalAmount: totalAmount,
    },
  });
});

// @desc    Toggle coupon active status
// @route   PATCH /api/coupons/:id/toggle-active
// @access  Private/Admin
exports.toggleCouponActive = asyncHandler(async (req, res, next) => {
  const coupon = await findNonDeleted({
    model: Coupon,
    filter : {_id: req.params.id}
  });

  if (!coupon) {
    return next(new ApiError("Coupon not found", 404));
  }

  const updatedCoupon = await update({
    model: Coupon,
    filter: { _id: req.params.id },
    data: { isActive: !coupon.isActive }
  });

  res.status(200).json({
    status: "success",
    data: {
      coupon: updatedCoupon.toPublicJSON(),
    },
  });
});

// @desc    Get coupons by creator
// @route   GET /api/coupons/my-coupons
// @access  Private/Admin
exports.getMyCoupons = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort || { createdAt: -1 };

  const result = await findWithPagination({
    model: Coupon,
    filter: { createdBy: req.user._id , isDeleted: false},
    page,
    limit,
    sort,
    select: "-__v"
  });

  const populatedCoupons = await Promise.all(
    result.data.map(async (coupon) => {
      return await findById({
        model: Coupon,
        id: coupon._id
      });
    })
  );

  res.status(200).json({
    status: "success",
    results: result.pagination.totalCount,
    pagination: result.pagination,
    data: {
      coupons: populatedCoupons.map(coupon => coupon.toPublicJSON()),
    },
  });
});

// @desc    Apply coupon and increment usage
// @route   POST /api/coupons/:id/apply
// @access  Private
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  const { totalAmount } = req.body;

  const coupon = await findNonDeleted({
    model: Coupon,
    filter: { _id: req.params.id }
  });

  if (!coupon) {
    return next(new ApiError("Coupon not found", 404));
  }

  if (!coupon.isValid()) {
    return next(new ApiError("Coupon is expired, inactive, or fully used", 400));
  }

  if (totalAmount < coupon.minOrderAmount) {
    return next(
      new ApiError(
        `Minimum order amount for this coupon is ${coupon.minOrderAmount}`,
        400
      )
    );
  }

  // Calculate discount using model method
  const discountAmount = coupon.calculateDiscount(totalAmount);
  const finalAmount = totalAmount - discountAmount;

  // Increment usage count
  await coupon.incrementUsage();

  res.status(200).json({
    status: "success",
    data: {
      isValid: true,
      coupon: coupon.toPublicJSON(),
      discountAmount,
      finalAmount,
      originalAmount: totalAmount,
    },
  });
});


// @desc    Restore soft deleted coupon
// @route   PATCH /api/coupons/:id/restore
// @access  Private/Admin
exports.restoreCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await restoreSoftDelete({
    model: Coupon,
    filter: { _id: req.params.id }
  });

  if (!coupon) {
    return next(new ApiError("Coupon not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      coupon: coupon.toPublicJSON(),
    },
  });
});