const { check, param } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Review = require('../../models/reviewModel');
const Product = require('../../models/productModel');
const db = require('./../../services/DB/db.services');

exports.createReviewValidator = [
    check('title')
        .optional()
        .isLength({ min: 1 })
        .withMessage('Review title must be at least 1 character')
        .isLength({ max: 100 })
        .withMessage('Review title cannot exceed 100 characters'),
    
    check('ratings')
        .notEmpty()
        .withMessage('Ratings value is required')
        .isFloat({ min: 1, max: 5 })
        .withMessage('Ratings value must be between 1.0 and 5.0'),
    
    check('product')
        .isMongoId()
        .withMessage('Invalid Product id format')
        .custom(async (val, { req }) => {
            // Check if product exists
            const product = await db.findOne({
                model: Product,
                filter: { _id: val, isDeleted: { $ne: true } }
            });
            
            if (!product) {
                throw new Error('Product not found');
            }
            return true;
        })
        .custom(async (val, { req }) => {
            // Check if logged user already created a review for this product
            const review = await db.findOne({
                model: Review,
                filter: {
                    user: req.user._id,
                    product: val,
                }
            });
            
            if (review) {
                throw new Error('You have already created a review for this product');
            }
            return true;
        }),

    check('comment')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Review comment cannot exceed 500 characters'),

    validatorMiddleware,
];

exports.getReviewValidator = [
    param('id')
        .isMongoId()
        .withMessage('Invalid Review id format')
        .custom(async (val, { req }) => {
            const review = await db.findOne({
                model: Review,
                filter: { _id: val }
            });
            
            if (!review) {
                throw new Error('Review not found');
            }
            return true;
        }),
    validatorMiddleware,
];

exports.updateReviewValidator = [
    param('id')
        .isMongoId()
        .withMessage('Invalid Review id format')
        .custom(async (val, { req }) => {
            const review = await db.findOne({
                model: Review,
                filter: { _id: val }
            });
            
            if (!review) {
                throw new Error('Review not found');
            }
            
            // Check if user owns the review
            if (review.user._id.toString() !== req.user._id.toString()) {
                throw new Error('You are not allowed to update this review');
            }
            return true;
        }),
    
    check('title')
        .optional()
        .isLength({ min: 1 })
        .withMessage('Review title must be at least 1 character')
        .isLength({ max: 100 })
        .withMessage('Review title cannot exceed 100 characters'),
    
    check('ratings')
        .optional()
        .isFloat({ min: 1, max: 5 })
        .withMessage('Ratings value must be between 1.0 and 5.0'),
    
    check('comment')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Review comment cannot exceed 500 characters'),

    validatorMiddleware,
];

exports.deleteReviewValidator = [
    param('id')
        .isMongoId()
        .withMessage('Invalid Review id format')
        .custom(async (val, { req }) => {
            const review = await db.findOne({
                model: Review,
                filter: { _id: val }
            });
            
            if (!review) {
                throw new Error('Review not found');
            }
            
            // Check permissions: user can only delete their own reviews, admin/manager can delete any
            if (req.user.role === 'user' && review.user._id.toString() !== req.user._id.toString()) {
                throw new Error('You are not allowed to delete this review');
            }
            return true;
        }),
    validatorMiddleware,
];

exports.productReviewsValidator = [
    param('productId')
        .isMongoId()
        .withMessage('Invalid Product id format')
        .custom(async (val, { req }) => {
            const product = await db.findOne({
                model: Product,
                filter: { _id: val, isDeleted: { $ne: true } }
            });
            
            if (!product) {
                throw new Error('Product not found');
            }
            return true;
        }),
    validatorMiddleware,
];

exports.markHelpfulValidator = [
    param('id')
        .isMongoId()
        .withMessage('Invalid Review id format')
        .custom(async (val, { req }) => {
            const review = await db.findOne({
                model: Review,
                filter: { _id: val }
            });
            
            if (!review) {
                throw new Error('Review not found');
            }
            
            // User cannot mark their own review as helpful
            if (review.user._id.toString() === req.user._id.toString()) {
                throw new Error('You cannot mark your own review as helpful');
            }
            return true;
        }),
    validatorMiddleware,
];

exports.reviewStatsValidator = [
    param('productId')
        .isMongoId()
        .withMessage('Invalid Product id format')
        .custom(async (val, { req }) => {
            const product = await db.findOne({
                model: Product,
                filter: { _id: val, isDeleted: { $ne: true } }
            });
            
            if (!product) {
                throw new Error('Product not found');
            }
            return true;
        }),
    validatorMiddleware,
];

// Query parameter validators
exports.queryParamsValidator = [
    check('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    check('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    
    check('sort')
        .optional()
        .isIn(['createdAt', '-createdAt', 'ratings', '-ratings', 'helpful', '-helpful'])
        .withMessage('Sort must be a valid field: createdAt, ratings, or helpful'),
    
    check('ratings')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Ratings filter must be between 1 and 5'),
    
    validatorMiddleware,
];