const slugify = require("slugify");
const { check, body, param, query } = require('express-validator');
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const db = require("../../services/DB/db.services");
const Product = require("../../models/productModel");
const SubCategory = require("../../models/subCategoryModel");
const Brand = require("../../models/brandModel");

exports.getProductValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid Product id format")
        .custom(async (value, { req }) => {
            const product = await db.findNonDeleted({
                model: Product,
                filter: { 
                    $or: [
                        { _id: value },
                        { slug: value }
                    ]
                }
            });
            
            if (!product) {
                throw new Error('Product not found');
            }
            req.product = product;
            return true;
        }),
    validatorMiddleware,
];

exports.createProductValidator = [
    check("title")
        .notEmpty()
        .withMessage("Product title is required")
        .isLength({ min: 3 })
        .withMessage("Too short product title (min 3 characters)")    
        .isLength({ max: 100 })
        .withMessage("Too long product title (max 100 characters)")
        .custom(async (value) => {
            const existingProduct = await db.findNonDeleted({
                model: Product,
                filter: { title: value }
            });
            
            if (existingProduct) {
                throw new Error('Product with this title already exists');
            }
            return true;
        }),
    
    check("slug")
        .optional()
        .isSlug()
        .withMessage("Invalid slug format")
        .custom(async (value) => {
            const existingProduct = await db.findNonDeleted({
                model: Product,
                filter: { slug: value }
            });
            
            if (existingProduct) {
                throw new Error('Product with this slug already exists');
            }
            return true;
        }),
    
    body("title").custom(async (val, { req }) => {
        if (val && !req.body.slug) {
            const generatedSlug = slugify(val);
            
            // Check if the generated slug already exists
            const existingProduct = await db.findNonDeleted({
                model: Product,
                filter: { slug: generatedSlug }
            });
            
            if (existingProduct) {
                throw new Error(`Slug '${generatedSlug}' already exists. Please provide a custom slug.`);
            }
            
            req.body.slug = generatedSlug;
        }
        return true;
    }),
    
    check("description")
        .notEmpty()
        .withMessage("Product description is required")
        .isLength({ min: 20 })
        .withMessage("Too short product description (min 20 characters)"),
    
    check("quantity")
        .notEmpty()
        .withMessage("Product quantity is required")
        .isInt({ min: 0 })
        .withMessage("Quantity must be a positive integer"),
    
    check("price")
        .notEmpty()
        .withMessage("Product price is required")
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),
    
    check("priceAfterDiscount")
        .optional() // Changed from notEmpty() to optional()
        .isFloat({ min: 0 })
        .withMessage("Discounted price must be a positive number")
        .custom((value, { req }) => {
            if (value && value > req.body.price) {
                throw new Error('Discounted price cannot be higher than original price');
            }
            return true;
        }),
    
    check("subcategory")
        .isMongoId()
        .withMessage("Invalid subcategory ID format")
        .custom(async (value) => {
            const subcategory = await db.findNonDeleted({
                model: SubCategory,
                filter: { _id: value }
            });
            
            if (!subcategory) {
                throw new Error('Subcategory not found');
            }
            return true;
        }),
    
    check("brand")
        .isMongoId() // Removed notEmpty() since isMongoId() already checks for presence
        .withMessage("Invalid brand ID format")
        .custom(async (value) => {
            const brand = await db.findNonDeleted({
                model: Brand,
                filter: { _id: value }
            });
            
            if (!brand) {
                throw new Error('Brand not found');
            }
            return true;
        }),
    
    check("colors")
        .optional()
        .isArray()
        .withMessage("Colors must be an array"),
    
    check("imageCover")
        .optional()
        .isURL()
        .withMessage("Invalid image cover URL format"),
    
    check("images")
        .optional()
        .isArray()
        .withMessage("Images must be an array"),
    
    validatorMiddleware,
];

exports.updateProductValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid product id format")
        .custom(async (value, { req }) => {
            const product = await db.findNonDeleted({
                model: Product,
                filter: { _id: value }
            });
            
            if (!product) {
                throw new Error('Product not found');
            }
            req.existingProduct = product;
            return true;
        }),
    
    check("title")
        .optional()
        .isLength({ min: 3 })
        .withMessage("Too short product title (min 3 characters)")    
        .isLength({ max: 100 })
        .withMessage("Too long product title (max 100 characters)")
        .custom(async (value, { req }) => {
            if (value && value !== req.existingProduct.title) {
                const existingProduct = await db.findNonDeleted({
                    model: Product,
                    filter: { 
                        title: value,
                        _id: { $ne: req.params.id }
                    }
                });
                
                if (existingProduct) {
                    throw new Error('Product with this title already exists');
                }
            }
            return true;
        }),
    
    check("slug")
        .optional()
        .isSlug()
        .withMessage("Invalid slug format")
        .custom(async (value, { req }) => {
            if (value && value !== req.existingProduct.slug) {
                const existingProduct = await db.findNonDeleted({
                    model: Product,
                    filter: { 
                        slug: value,
                        _id: { $ne: req.params.id }
                    }
                });
                
                if (existingProduct) {
                    throw new Error('Product with this slug already exists');
                }
            }
            return true;
        }),
    
    body("title").custom((val, { req }) => {
        if (val && val !== req.existingProduct.title && !req.body.slug) {
            req.body.slug = slugify(val);
        }
        return true;
    }),
    
    check("description")
        .optional()
        .isLength({ min: 20 })
        .withMessage("Too short product description (min 20 characters)"),
    
    check("quantity")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Quantity must be a positive integer"),
    
    check("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),
    
    check("priceAfterDiscount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Discounted price must be a positive number")
        .custom((value, { req }) => {
            const price = req.body.price || req.existingProduct.price;
            if (value && value > price) {
                throw new Error('Discounted price cannot be higher than original price');
            }
            return true;
        }),
    
    // UPDATED: subcategory validation (now single reference)
    check("subcategory")
        .optional()
        .isMongoId()
        .withMessage("Invalid subcategory ID format")
        .custom(async (value) => {
            const subcategory = await db.findNonDeleted({
                model: SubCategory,
                filter: { _id: value }
            });
            
            if (!subcategory) {
                throw new Error('Subcategory not found');
            }
            return true;
        }),
    
    check("brand")
        .optional()
        .isMongoId()
        .withMessage("Invalid brand ID format")
        .custom(async (value) => {
            if (value) {
                const brand = await db.findNonDeleted({
                    model: Brand,
                    filter: { _id: value }
                });
                
                if (!brand) {
                    throw new Error('Brand not found');
                }
            }
            return true;
        }),
    
    validatorMiddleware,
];

exports.deleteProductValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid product id format")
        .custom(async (value) => {
            const product = await db.findNonDeleted({
                model: Product,
                filter: { _id: value }
            });
            
            if (!product) {
                throw new Error('Product not found or already deleted');
            }
            return true;
        }),
    validatorMiddleware,
];

exports.getProductsValidator = [
  // Pagination validation
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  // Subcategory validation
  query('subcategory')
    .optional()
    .isMongoId()
    .withMessage('Invalid subcategory ID format')
    .custom(async (value) => {
      const subcategory = await db.findNonDeleted({
        model: SubCategory,
        filter: { _id: value }
      });
      
      if (!subcategory) {
        throw new Error('Subcategory not found');
      }
      return true;
    }),

  // Brand validation
  query('brand')
    .optional()
    .isMongoId()
    .withMessage('Invalid brand ID format')
    .custom(async (value) => {
      const brand = await db.findNonDeleted({
        model: Brand,
        filter: { _id: value }
      });
      
      if (!brand) {
        throw new Error('Brand not found');
      }
      return true;
    }),

  // Price range validation
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number')
    .toFloat(),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number')
    .toFloat()
    .custom((value, { req }) => {
      if (req.query.minPrice && value < parseFloat(req.query.minPrice)) {
        throw new Error('Maximum price cannot be less than minimum price');
      }
      return true;
    }),

  // Search validation
  query('title')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title search must be between 1 and 100 characters')
    .trim()
    .escape(),

  // Sort validation
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'price', '-price', 'title', '-title', 'sold', '-sold', 'ratingsAverage', '-ratingsAverage'])
    .withMessage('Invalid sort parameter. Allowed values: createdAt, -createdAt, price, -price, title, -title, sold, -sold, ratingsAverage, -ratingsAverage'),

  // Rating filter validation
  query('minRating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Minimum rating must be between 1 and 5')
    .toFloat(),

  query('maxRating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Maximum rating must be between 1 and 5')
    .toFloat()
    .custom((value, { req }) => {
      if (req.query.minRating && value < parseFloat(req.query.minRating)) {
        throw new Error('Maximum rating cannot be less than minimum rating');
      }
      return true;
    }),

  // Quantity filter validation
  query('inStock')
    .optional()
    .isBoolean()
    .withMessage('inStock must be a boolean (true/false)')
    .toBoolean(),

  // Color filter validation
  query('color')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Color must be between 1 and 50 characters')
    .trim()
    .escape(),

  validatorMiddleware,
];

exports.restoreProductValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid product id format")
        .custom(async (value) => {
            const product = await db.findOne({
                model: Product,
                filter: { 
                    _id: value,
                    isDeleted: true 
                }
            });

            console.log(product);
            
            if (!product) {
                throw new Error('Product not found or not deleted');
            }
            return true;
        }),
    validatorMiddleware,
];

exports.getProductsValidator = [
  // Page validation
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  // Limit validation
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  // Subcategory validation
  query("subcategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory ID format")
    .custom(async (value) => {
      const subcategory = await db.findNonDeleted({
        model: SubCategory,
        filter: { _id: value }
      });
      
      if (!subcategory) {
        throw new Error('Subcategory not found');
      }
      return true;
    }),

  // Brand validation
  query("brand")
    .optional()
    .isMongoId()
    .withMessage("Invalid brand ID format")
    .custom(async (value) => {
      const brand = await db.findNonDeleted({
        model: Brand,
        filter: { _id: value }
      });
      
      if (!brand) {
        throw new Error('Brand not found');
      }
      return true;
    }),

  // Price range validation
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a positive number"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a positive number")
    .custom((value, { req }) => {
      if (req.query.minPrice && parseFloat(value) < parseFloat(req.query.minPrice)) {
        throw new Error('Maximum price cannot be less than minimum price');
      }
      return true;
    }),

  // Title search validation
  query("title")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title search must be between 1 and 100 characters")
    .trim(),

  // Sort validation (optional - if you want to allow sorting)
  query("sort")
    .optional()
    .isIn(['createdAt', '-createdAt', 'price', '-price', 'title', '-title', 'sold', '-sold'])
    .withMessage("Invalid sort parameter"),

  validatorMiddleware,
];

exports.getDeletedProductsValidator = [
  // Pagination validation
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  // Subcategory validation for deleted products
  query('subcategory')
    .optional()
    .isMongoId()
    .withMessage('Invalid subcategory ID format')
    .custom(async (value) => {
      const subcategory = await db.findOne({
        model: SubCategory,
        filter: { _id: value }
      });
      
      if (!subcategory) {
        throw new Error('Subcategory not found');
      }
      return true;
    }),

  // Brand validation for deleted products
  query('brand')
    .optional()
    .isMongoId()
    .withMessage('Invalid brand ID format')
    .custom(async (value) => {
      const brand = await db.findOne({
        model: Brand,
        filter: { _id: value }
      });
      
      if (!brand) {
        throw new Error('Brand not found');
      }
      return true;
    }),

  // Price range validation
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number')
    .toFloat(),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number')
    .toFloat()
    .custom((value, { req }) => {
      if (req.query.minPrice && value < parseFloat(req.query.minPrice)) {
        throw new Error('Maximum price cannot be less than minimum price');
      }
      return true;
    }),

  // Search validation
  query('title')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title search must be between 1 and 100 characters')
    .trim()
    .escape(),

  // Sort validation for deleted products
  query('sort')
    .optional()
    .isIn(['deletedAt', '-deletedAt', 'createdAt', '-createdAt', 'title', '-title'])
    .withMessage('Invalid sort parameter. Allowed values: deletedAt, -deletedAt, createdAt, -createdAt, title, -title'),
  validatorMiddleware,
];