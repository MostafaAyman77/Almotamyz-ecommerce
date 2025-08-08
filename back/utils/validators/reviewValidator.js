const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Review = require('../../models/reviewModel');

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
        .withMessage('Ratings value must be between 1 to 5'),
    
    check('user')
        .isMongoId()
        .withMessage('Invalid User id format'),
    
    check('product')
        .isMongoId()
        .withMessage('Invalid Product id format')
        .custom(async (val, { req }) => {
            // Check if logged user create review before
            const review = await Review.findOne({
                user: req.user._id,
                product: req.body.product,
            });
            if (review) {
                throw new Error('You already created a review before');
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
    check('id').isMongoId().withMessage('Invalid Review id format'),
    validatorMiddleware,
];

exports.updateReviewValidator = [
    check('id').isMongoId().withMessage('Invalid Review id format'),
    
    check('title')
        .optional()
        .isLength({ min: 1 })
        .withMessage('Review title must be at least 1 character')
        .isLength({ max: 100 })
        .withMessage('Review title cannot exceed 100 characters'),
    
    check('ratings')
        .optional()
        .isFloat({ min: 1, max: 5 })
        .withMessage('Ratings value must be between 1 to 5'),
    
    check('comment')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Review comment cannot exceed 500 characters'),

    validatorMiddleware,
];

exports.deleteReviewValidator = [
    check('id').isMongoId().withMessage('Invalid Review id format'),
    validatorMiddleware,
];

