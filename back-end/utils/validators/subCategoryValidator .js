const { check } = require('express-validator');
const validatorMiddleware = require("../../middlewares/validatorMiddleware")

exports.getSubCategoryValidator = [
    check("id").isMongoId().withMessage("Invalid SubCategory id format"),
    validatorMiddleware,
]

exports.createSubCategoryValidator = [
    check("name").notEmpty().withMessage("SubCategory required")
    .isLength({min: 2}).withMessage("Too short SubCategory name")    
    .isLength({max: 32}).withMessage("Too long SubCategory name"),
    check("category").notEmpty().withMessage("subCategory must be belong to category")
    .isMongoId().withMessage("Invalid category ID"),
    validatorMiddleware,    
]

exports.updateSubCategoryValidator = [
    check("id").isMongoId().withMessage("Invalid SubCategory id format"),
    check("id").notEmpty().withMessage("id must be write"),
    validatorMiddleware,
]

exports.deleteSubCategoryValidator = [
    check("id").isMongoId().withMessage("Invalid SubCategory id format"),
    check("id").notEmpty().withMessage("id must be write"),
    validatorMiddleware,
]