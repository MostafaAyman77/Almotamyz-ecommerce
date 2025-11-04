const slugify = require("slugify");
const { check, body, param } = require('express-validator');
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const db = require("./../../services/DB/db.services");
const Brand = require("./../../models/brandModel");

exports.getBrandValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid Brand id format")
        .custom(async (value, { req }) => {
            // Check if brand exists and is not deleted
            const brand = await db.findOne({
                model: Brand,
                filter: { 
                    $or: [
                        { _id: value },
                        { slug: value }
                    ],
                    isDeleted: { $ne: true }
                }
            });
            
            if (!brand) {
                throw new Error('Brand not found');
            }
            req.brand = brand; // Attach brand to request for later use
            return true;
        }),
    validatorMiddleware,
];

exports.createBrandValidator = [
    check("name")
        .notEmpty()
        .withMessage("Brand name is required")
        .isLength({ min: 3 })
        .withMessage("Too short brand name (min 3 characters)")    
        .isLength({ max: 32 })
        .withMessage("Too long brand name (max 32 characters)")
        .custom(async (value) => {
            // Check if brand name already exists
            const existingBrand = await db.findOne({
                model: Brand,
                filter: { name: value }
            });
            
            if (existingBrand) {
                throw new Error('Brand with this name already exists');
            }
            return true;
        }),
    
    check("slug")
        .optional()
        .isSlug()
        .withMessage("Invalid slug format")
        .custom(async (value) => {
            // Check if slug already exists
            const existingBrand = await db.findOne({
                model: Brand,
                filter: { slug: value }
            });
            
            if (existingBrand) {
                throw new Error('Brand with this slug already exists');
            }
            return true;
        }),
    
    body("name").custom((val, { req }) => {
        // Auto-generate slug if not provided
        if (val && !req.body.slug) {
            req.body.slug = slugify(val);
        }
        return true;
    }),
    
    check("image")
        .optional()
        .isURL()
        .withMessage("Invalid image URL format"),
    
    validatorMiddleware,
];

exports.updateBrandValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid brand id format")
        .custom(async (value, { req }) => {
            // Check if brand exists
            const brand = await db.findById({
                model: Brand,
                id: value
            });
            
            if (!brand) {
                throw new Error('Brand not found');
            }
            req.existingBrand = brand; // Attach existing brand to request
            return true;
        }),
    
    body("name")
        .optional()
        .isLength({ min: 3 })
        .withMessage("Too short brand name (min 3 characters)")    
        .isLength({ max: 32 })
        .withMessage("Too long brand name (max 32 characters)")
        .custom(async (value, { req }) => {
            if (value && value !== req.existingBrand.name) {
                // Check if new name already exists
                const existingBrand = await db.findOne({
                    model: Brand,
                    filter: { 
                        name: value,
                        _id: { $ne: req.params.id }
                    }
                });
                
                if (existingBrand) {
                    throw new Error('Brand with this name already exists');
                }
            }
            return true;
        }),
    
    body("slug")
        .optional()
        .isSlug()
        .withMessage("Invalid slug format")
        .custom(async (value, { req }) => {
            if (value && value !== req.existingBrand.slug) {
                // Check if new slug already exists
                const existingBrand = await db.findOne({
                    model: Brand,
                    filter: { 
                        slug: value,
                        _id: { $ne: req.params.id }
                    }
                });
                
                if (existingBrand) {
                    throw new Error('Brand with this slug already exists');
                }
            }
            return true;
        }),
    
    body("name").custom((val, { req }) => {
        // Auto-update slug if name changes and slug not explicitly provided
        if (val && val !== req.existingBrand.name && !req.body.slug) {
            req.body.slug = slugify(val);
        }
        return true;
    }),
    
    check("image")
        .optional()
        .isURL()
        .withMessage("Invalid image URL format"),
    
    validatorMiddleware,
];

exports.deleteBrandValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid brand id format")
        .custom(async (value) => {
            // Check if brand exists and is not already deleted
            const brand = await db.findOne({
                model: Brand,
                filter: { 
                    _id: value,
                    isDeleted: { $ne: true }
                }
            });
            
            if (!brand) {
                throw new Error('Brand not found or already deleted');
            }
            return true;
        }),
    validatorMiddleware,
];

exports.restoreBrandValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid brand id format")
        .custom(async (value) => {
            // Check if brand exists and is deleted
            const brand = await db.findOne({
                model: Brand,
                filter: { 
                    _id: value,
                    isDeleted: true 
                }
            });
            
            if (!brand) {
                throw new Error('Brand not found or not deleted');
            }
            return true;
        }),
    validatorMiddleware,
];