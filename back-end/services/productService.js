const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const slugify = require("slugify");

const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");
const db = require("../services/DB/db.services");
const Product = require("../models/productModel");
const SubCategoryModel = require("../models/subCategoryModel.js");

exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  //1- Image processing for imageCover
  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverFileName}`);

    // Save image into our db
    req.body.imageCover = imageCoverFileName;
  }
  //2- Image processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);

        // Save image into our db
        req.body.images.push(imageName);
      })
    );
  }
  next();
});

// @desc    Get list of products
// @route   GET /api/v1/products?page=1&limit=5
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Build filter object
  const filter = {};
  
  // Filter by subcategory if provided
  if (req.query.subcategory) {
    filter.subcategory = req.query.subcategory;
  }
  
  // Filter by brand if provided
  if (req.query.brand) {
    filter.brand = req.query.brand;
  }
  
  // Filter by price range if provided
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Filter by rating range if provided
  if (req.query.minRating || req.query.maxRating) {
    filter.ratingsAverage = {};
    if (req.query.minRating) filter.ratingsAverage.$gte = parseFloat(req.query.minRating);
    if (req.query.maxRating) filter.ratingsAverage.$lte = parseFloat(req.query.maxRating);
  }

  // Filter by stock availability
  if (req.query.inStock !== undefined) {
    if (req.query.inStock === 'true' || req.query.inStock === true) {
      filter.quantity = { $gt: 0 };
    } else {
      filter.quantity = { $lte: 0 };
    }
  }

  // Filter by color if provided
  if (req.query.color) {
    filter.colors = { $in: [new RegExp(req.query.color, 'i')] };
  }

  // Search by title if provided
  if (req.query.title) {
    filter.title = { $regex: req.query.title, $options: 'i' };
  }

  // Build sort object
  let sort = { createdAt: -1 }; // Default sort
  if (req.query.sort) {
    sort = {};
    const sortField = req.query.sort.startsWith('-') ? req.query.sort.slice(1) : req.query.sort;
    const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
    sort[sortField] = sortOrder;
  }

  const result = await db.findWithPagination({
    model: Product,
    filter,
    page,
    limit,
    sort
  });

  res.status(200).json({
    status: "success",
    results: result.data.length,
    pagination: result.pagination,
    data: result.data,
  });
});

// @desc    Get products by specific subcategory
// @route   GET /api/v1/products/subcategory/:subCategoryId
// @access  Public
exports.getProductsBySubCategory = asyncHandler(async (req, res) => {
  const { subCategoryId } = req.params;

  // Validate if subcategory exists
  const subcategory = await db.findNonDeleted({
    model: SubCategoryModel,
    filter: { _id: subCategoryId }
  });

  if (!subcategory) {
    return res.status(404).json({
      status: "fail",
      message: "Subcategory not found",
    });
  }

  const products = await db.findManyNonDeleted({
    model: Product,
    filter: {
      subcategory: subCategoryId
    }
  });

  res.status(200).json({
    status: "success",
    results: products.length,
    data: products,
  });
});

// @desc    Get specific product by id
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await db.findNonDeleted({
    model: Product,
    filter: { 
      $or: [
        { _id: req.params.id },
        { slug: req.params.id }
      ]
    }
  });

  if (!product) {
    return res.status(404).json({
      status: "fail",
      message: "Product not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: product,
  });
});

// @desc    Create product
// @route   POST /api/v1/products
// @access  Private
exports.createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;

  // Auto-generate slug if not provided
  if (!productData.slug && productData.title) {
    productData.slug = slugify(productData.title, { lower: true });
  }

  const product = await db.create({
    model: Product,
    data: productData
  });

  res.status(201).json({
    status: "success",
    data: product,
  });
});

// @desc    Update specific product
// @route   PUT /api/v1/products/:id
// @access  Private 
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await db.findByIdAndUpdate({
    model: Product,
    id: req.params.id,
    data: req.body
  });

  if (!product) {
    return res.status(404).json({
      status: "fail",
      message: "Product not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: product,
  });
});

// @desc    Delete Specific product (Soft Delete)
// @route   DELETE /api/v1/products/:id
// @access  Private
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await db.softDelete({
    model: Product,
    filter: { _id: req.params.id }
  });

  if (!product) {
    return res.status(404).json({
      status: "fail",
      message: "Product not found",
    });
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// @desc    Restore deleted product
// @route   PATCH /api/v1/products/:id/restore
// @access  Private
exports.restoreProduct = asyncHandler(async (req, res) => {
  const product = await db.restoreSoftDelete({
    model: Product,
    filter: { _id: req.params.id }
  });

  if (!product) {
    return res.status(404).json({
      status: "fail",
      message: "Product not found or not deleted",
    });
  }

  res.status(200).json({
    status: "success",
    data: product,
  });
});

// @desc    Get deleted products (Admin only)
// @route   GET /api/v1/products/deleted
// @access  Private
exports.getDeletedProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Build filter object for deleted products
  const filter = { isDeleted: true };

  // Filter by subcategory if provided
  if (req.query.subcategory) {
    filter.subcategory = req.query.subcategory;
  }
  
  // Filter by brand if provided
  if (req.query.brand) {
    filter.brand = req.query.brand;
  }
  
  // Filter by price range if provided
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Filter by deletion date range
  if (req.query.deletedFrom || req.query.deletedTo) {
    filter.deletedAt = {};
    if (req.query.deletedFrom) filter.deletedAt.$gte = new Date(req.query.deletedFrom);
    if (req.query.deletedTo) filter.deletedAt.$lte = new Date(req.query.deletedTo);
  }

  // Search by title if provided
  if (req.query.title) {
    filter.title = { $regex: req.query.title, $options: 'i' };
  }

  // Build sort object (default sort by deletion date)
  let sort = { deletedAt: -1 };
  if (req.query.sort) {
    sort = {};
    const sortField = req.query.sort.startsWith('-') ? req.query.sort.slice(1) : req.query.sort;
    const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
    sort[sortField] = sortOrder;
  }

  const result = await db.findWithPagination({
    model: Product,
    filter,
    page,
    limit,
    sort
  });

  res.status(200).json({
    status: "success",
    results: result.data.length,
    pagination: result.pagination,
    data: result.data,
  });
});


