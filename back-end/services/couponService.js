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
    discount,
    maxUses,
    minOrderAmount,
    maxDiscountAmount,
    applicableProducts,
    applicableCategories,
  } = req.body;

  // Check if coupon name already exists
  const existingCoupon = await findOne({
    model: Coupon,
    filter: { name: name.toUpperCase() }
  });

  if (existingCoupon) {
    return next(new ApiError("Coupon name already exists", 400));
  }

  const coupon = await create({
    model: Coupon,
    data: {
      name: name.toUpperCase(),
      expire,
      discount,
      maxUses: maxUses || null,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      createdBy: req.user._id,
    }
  });

  // Populate the created coupon
  const populatedCoupon = await findById({
    model: Coupon,
    id: coupon._id
  })
  
  console.log(populatedCoupon.toPublicJSON())

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
    page,
    limit,
    sort,
    select: "-__v"
  });

  // Populate each coupon
  const populatedCoupons = await Promise.all(
    result.data.map(async (coupon) => {
      return await findById({
        model: Coupon,
        id: coupon._id
      })
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
  const coupon = await findById({
    model: Coupon,
    id: req.params.id
  })

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

  // If name is being updated, check for uniqueness
  if (name) {
    const existingCoupon = await findOne({
      model: Coupon,
      filter: {
        name: name.toUpperCase(),
        _id: { $ne: req.params.id }
      }
    });

    if (existingCoupon) {
      return next(new ApiError("Coupon name already exists", 400));
    }
    updateData.name = name.toUpperCase();
  }

  const coupon = await findByIdAndUpdate({
    model: Coupon,
    id: req.params.id,
    data: updateData,
    options: { new: true, runValidators: true }
  })

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

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await softDelete(
    {
      model: Coupon,
      filter : {_id: req.params.id}
    }
  );

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
  const { couponName, products, totalAmount } = req.body;

  const coupon = await findOne({
    model: Coupon,
    filter: { name: couponName.toUpperCase() }
  })

  if (!coupon) {
    return next(new ApiError("Invalid coupon", 400));
  }

  // Check if coupon is valid using the model method
  if (!coupon.isValid()) {
    return next(new ApiError("Coupon is expired or inactive", 400));
  }

  // Check minimum order amount
  if (totalAmount < coupon.minOrderAmount) {
    return next(
      new ApiError(
        `Minimum order amount for this coupon is ${coupon.minOrderAmount}`,
        400
      )
    );
  }

  // Check if products are applicable
  if (coupon.applicableProducts.length > 0 || coupon.applicableCategories.length > 0) {
    const productIds = products.map(p => p.productId.toString());
    const productCategories = products.map(p => p.subcategoryId.toString());
    
    const hasApplicableProduct = coupon.applicableProducts.some(productId =>
      productIds.includes(productId.toString())
    );
    
    const hasApplicableCategory = coupon.applicableCategories.some(categoryId =>
      productCategories.includes(categoryId.toString())
    );

    if (!hasApplicableProduct && !hasApplicableCategory) {
      return next(new ApiError("Coupon not applicable to selected products", 400));
    }
  }

  // Calculate discount
  let discountAmount = (totalAmount * coupon.discount) / 100;
  
  // Apply maximum discount limit if set
  if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
    discountAmount = coupon.maxDiscountAmount;
  }

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
  const coupon = await findById({
    model: Coupon,
    id: req.params.id
  });

  if (!coupon) {
    return next(new ApiError("Coupon not found", 404));
  }

  const updatedCoupon = await update({
    model: Coupon,
    filter: { _id: req.params.id },
    data: { isActive: !coupon.isActive }
  })

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
    filter: { createdBy: req.user._id },
    page,
    limit,
    sort,
    select: "-__v"
  });

  // Populate each coupon
  const populatedCoupons = await Promise.all(
    result.data.map(async (coupon) => {
      return await findById({
        model: Coupon,
        id: coupon._id
      })
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
  const { products, totalAmount } = req.body;

  const coupon = await findNonDeleted({
    model: Coupon,
    filter : {_id : req.params.id}
  });

  if (!coupon) {
    return next(new ApiError("Coupon not found", 404));
  }

  // Validate coupon
  if (!coupon.isValid()) {
    return next(new ApiError("Coupon is expired or inactive", 400));
  }

  if (totalAmount < coupon.minOrderAmount) {
    return next(
      new ApiError(
        `Minimum order amount for this coupon is ${coupon.minOrderAmount}`,
        400
      )
    );
  }

  // Check product applicability if specified
  if (coupon.applicableProducts.length > 0 || coupon.applicableCategories.length > 0) {
    const productIds = products.map(p => p.productId.toString());
    const productCategories = products.map(p => p.subcategoryId.toString());
    
    const hasApplicableProduct = coupon.applicableProducts.some(productId =>
      productIds.includes(productId.toString())
    );
    
    const hasApplicableCategory = coupon.applicableCategories.some(categoryId =>
      productCategories.includes(categoryId.toString())
    );

    if (!hasApplicableProduct && !hasApplicableCategory) {
      return next(new ApiError("Coupon not applicable to selected products", 400));
    }
  }

  // Calculate discount
  let discountAmount = (totalAmount * coupon.discount) / 100;
  
  if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
    discountAmount = coupon.maxDiscountAmount;
  }

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