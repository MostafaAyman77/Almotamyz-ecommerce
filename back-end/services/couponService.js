const asyncHandler = require('express-async-handler');

const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');
const Coupon = require('../models/couponModel');

// @desc    Get list of coupons
// @route   GET /api/v1/coupons
// @access  Private/Admin-Manager
exports.getCoupons = factory.getAll(Coupon);

// @desc    Get specific coupon by id
// @route   GET /api/v1/coupons/:id
// @access  Private/Admin-Manager
exports.getCoupon = factory.getOne(Coupon);

// @desc    Create coupon
// @route   POST  /api/v1/coupons
// @access  Private/Admin-Manager
exports.createCoupon = asyncHandler(async (req, res, next) => {
    // Add the user who created the coupon
    req.body.createdBy = req.user._id;
    
    const coupon = await Coupon.create(req.body);
    
    res.status(201).json({
        status: 'success',
        data: coupon,
    });
});

// @desc    Update specific coupon
// @route   PUT /api/v1/coupons/:id
// @access  Private/Admin-Manager
exports.updateCoupon = factory.updateOne(Coupon);

// @desc    Delete specific coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Private/Admin-Manager
exports.deleteCoupon = factory.deleteOne(Coupon);

// @desc    Validate coupon
// @route   POST /api/v1/coupons/validate
// @access  Private/User
exports.validateCoupon = asyncHandler(async (req, res, next) => {
    const { couponName, orderAmount } = req.body;

    const coupon = await Coupon.findOne({
        name: couponName.toUpperCase(),
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

    let discountAmount = (orderAmount * coupon.discount) / 100;
    
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
    }

    const finalAmount = orderAmount - discountAmount;

    res.status(200).json({
        status: 'success',
        data: {
            coupon: {
                name: coupon.name,
                discount: coupon.discount,
                discountAmount,
                finalAmount,
            },
        },
    });
});

// @desc    Get active coupons
// @route   GET /api/v1/coupons/active
// @access  Public
exports.getActiveCoupons = asyncHandler(async (req, res, next) => {
    const coupons = await Coupon.find({
        isActive: true,
        expire: { $gt: Date.now() },
        $or: [
            { maxUses: null },
            { $expr: { $lt: ['$usedCount', '$maxUses'] } }
        ]
    }).select('name discount expire minOrderAmount maxDiscountAmount');

    res.status(200).json({
        status: 'success',
        results: coupons.length,
        data: coupons,
    });
});

