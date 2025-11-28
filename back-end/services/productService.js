const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const slugify = require("slugify");

const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");
const { 
  uploadToCloudinary, 
  deleteFromCloudinary,
  extractPublicId 
} = require("../config/cloudinaryConfig"); 
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
  const productId = req.params.id || 'temp-' + uuidv4();
  const cloudinaryFolder = `products/${productId}`;

  try {
    //1- Image processing for imageCover
    if (req.files.imageCover) {
      const processedBuffer = await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 95 })
        .toBuffer();

      // Upload to Cloudinary
      const result = await uploadToCloudinary(
        processedBuffer,
        cloudinaryFolder,
        `cover-${Date.now()}`
      );

      req.body.imageCover = result.secure_url;
      req.body.imageCoverPublicId = result.public_id;
    }

    //2- Image processing for images
    if (req.files.images) {
      req.body.images = [];
      req.body.imagesPublicIds = [];
      
      await Promise.all(
        req.files.images.map(async (img, index) => {
          const processedBuffer = await sharp(img.buffer)
            .resize(2000, 1333)
            .toFormat("jpeg")
            .jpeg({ quality: 95 })
            .toBuffer();

          // Upload to Cloudinary
          const result = await uploadToCloudinary(
            processedBuffer,
            cloudinaryFolder,
            `image-${index + 1}-${Date.now()}`
          );

          req.body.images.push(result.secure_url);
          req.body.imagesPublicIds.push(result.public_id);
        })
      );
    }

    // Store temporary product ID for create operation
    if (!req.params.id) {
      req.body.tempProductId = productId;
    }

    next();
  } catch (error) {
    console.error("Error processing images:", error);
    return res.status(500).json({
      status: "error",
      message: "Error uploading images to Cloudinary",
      error: error.message
    });
  }
});

// Helper function to rename Cloudinary folder when product is created
const renameCloudinaryFolder = async (oldFolder, newFolder, product) => {
  try {
    const updates = {
      imageCover: product.imageCover,
      imageCoverPublicId: product.imageCoverPublicId,
      images: product.images || [],
      imagesPublicIds: product.imagesPublicIds || []
    };

    // Rename cover image if exists
    if (product.imageCoverPublicId) {
      const oldPublicId = product.imageCoverPublicId;
      const newPublicId = oldPublicId.replace(oldFolder, newFolder);
      
      // Copy to new location
      const result = await uploadToCloudinary(
        await fetch(product.imageCover).then(r => r.buffer()),
        newFolder,
        newPublicId.split('/').pop().replace(/\.\w+$/, '')
      );
      
      updates.imageCover = result.secure_url;
      updates.imageCoverPublicId = result.public_id;
      
      // Delete old image
      await deleteFromCloudinary(oldPublicId);
    }

    // Rename additional images if exist
    if (product.imagesPublicIds && product.imagesPublicIds.length > 0) {
      const newImages = [];
      const newPublicIds = [];

      for (let i = 0; i < product.imagesPublicIds.length; i++) {
        const oldPublicId = product.imagesPublicIds[i];
        const newPublicId = oldPublicId.replace(oldFolder, newFolder);
        
        // Copy to new location
        const result = await uploadToCloudinary(
          await fetch(product.images[i]).then(r => r.buffer()),
          newFolder,
          newPublicId.split('/').pop().replace(/\.\w+$/, '')
        );
        
        newImages.push(result.secure_url);
        newPublicIds.push(result.public_id);
        
        // Delete old image
        await deleteFromCloudinary(oldPublicId);
      }

      updates.images = newImages;
      updates.imagesPublicIds = newPublicIds;
    }

    return updates;
  } catch (error) {
    console.error("Error renaming Cloudinary folder:", error);
    return null;
  }
};

// @desc    Add images to product (Cloudinary version)
// @route   PATCH /api/v1/products/:id/images
// @access  Private
exports.addProductImages = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const cloudinaryFolder = `products/${productId}`;
  
  console.log('Adding images to product:', productId);
  console.log('Files received:', req.files);

  // Check if product exists
  const product = await db.findNonDeleted({
    model: Product,
    filter: { _id: productId }
  });

  if (!product) {
    return res.status(404).json({
      status: "fail",
      message: "Product not found",
    });
  }

  // Initialize update data with existing values
  const updateData = {
    images: product.images || [],
    imagesPublicIds: product.imagesPublicIds || []
  };
  
  // Handle new images
  if (req.files && req.files.images && req.files.images.length > 0) {
    console.log(`Processing ${req.files.images.length} new images...`);
    
    const newImages = [];
    const newImagesPublicIds = [];
    
    // Process images sequentially
    for (let i = 0; i < req.files.images.length; i++) {
      const img = req.files.images[i];
      
      const processedBuffer = await sharp(img.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 95 })
        .toBuffer();

      // Upload to Cloudinary
      const result = await uploadToCloudinary(
        processedBuffer,
        cloudinaryFolder,
        `added-image-${Date.now()}-${i + 1}`
      );

      newImages.push(result.secure_url);
      newImagesPublicIds.push(result.public_id);
      
      console.log(`New image ${i + 1} uploaded:`, result.secure_url);
    }

    // Combine existing images with new ones
    updateData.images = [...updateData.images, ...newImages];
    updateData.imagesPublicIds = [...updateData.imagesPublicIds, ...newImagesPublicIds];
  }

  // Handle new cover image
  if (req.files && req.files.imageCover) {
    console.log('Processing new cover image...');
    
    const processedBuffer = await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toBuffer();

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      processedBuffer,
      cloudinaryFolder,
      `cover-updated-${Date.now()}`
    );

    updateData.imageCover = result.secure_url;
    updateData.imageCoverPublicId = result.public_id;
    
    console.log('New cover image uploaded:', result.secure_url);
  }

  console.log('Update data:', updateData);

  // Update product with new images
  const updatedProduct = await db.findByIdAndUpdate({
    model: Product,
    id: productId,
    data: updateData
  });

  if (!updatedProduct) {
    return res.status(404).json({
      status: "fail",
      message: "Failed to update product",
    });
  }

  res.status(200).json({
    status: "success",
    data: updatedProduct,
  });
});

// @desc    Delete product images (Cloudinary version)
// @route   DELETE /api/v1/products/:id/images
// @access  Private
exports.deleteProductImages = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const { imageUrls, deleteCover } = req.body;

  console.log('Deleting images for product:', productId);
  console.log('Image URLs to delete:', imageUrls);
  console.log('Delete cover:', deleteCover);

  // Check if product exists
  const product = await db.findNonDeleted({
    model: Product,
    filter: { _id: productId }
  });

  if (!product) {
    return res.status(404).json({
      status: "fail",
      message: "Product not found",
    });
  }

  const updateData = {};

  // Delete cover image if requested
  if (deleteCover && product.imageCoverPublicId) {
    console.log('Deleting cover image:', product.imageCoverPublicId);
    await deleteFromCloudinary(product.imageCoverPublicId);
    updateData.imageCover = null;
    updateData.imageCoverPublicId = null;
  }

  // Delete specific images
  if (imageUrls && imageUrls.length > 0) {
    const publicIdsToDelete = [];
    const remainingImages = [];
    const remainingPublicIds = [];

    // Find public IDs for the images to delete
    product.images.forEach((imageUrl, index) => {
      if (imageUrls.includes(imageUrl)) {
        const publicId = product.imagesPublicIds?.[index] || extractPublicId(imageUrl);
        if (publicId) {
          publicIdsToDelete.push(publicId);
          console.log('Marking image for deletion:', publicId);
        }
      } else {
        remainingImages.push(imageUrl);
        if (product.imagesPublicIds?.[index]) {
          remainingPublicIds.push(product.imagesPublicIds[index]);
        }
      }
    });

    // Delete from Cloudinary
    if (publicIdsToDelete.length > 0) {
      console.log('Deleting images from Cloudinary:', publicIdsToDelete);
      await Promise.all(
        publicIdsToDelete.map(publicId => deleteFromCloudinary(publicId))
      );
    }

    updateData.images = remainingImages;
    updateData.imagesPublicIds = remainingPublicIds;
  }

  console.log('Final update data:', updateData);

  // Update product
  const updatedProduct = await db.findByIdAndUpdate({
    model: Product,
    id: productId,
    data: updateData
  });

  if (!updatedProduct) {
    return res.status(404).json({
      status: "fail",
      message: "Failed to update product after image deletion",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Images deleted successfully",
    data: updatedProduct,
  });
});

// @desc    Get product images
// @route   GET /api/v1/products/:id/images
// @access  Public
exports.getProductImages = asyncHandler(async (req, res) => {
  const product = await db.findNonDeleted({
    model: Product,
    filter: { _id: req.params.id },
    select: 'imageCover images imagesPublicIds imageCoverPublicId title'
  });

  if (!product) {
    return res.status(404).json({
      status: "fail",
      message: "Product not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      imageCover: product.imageCover,
      imageCoverPublicId: product.imageCoverPublicId,
      images: product.images || [],
      imagesPublicIds: product.imagesPublicIds || [],
      productTitle: product.title
    },
  });
});

// Also update your createProduct function to handle Cloudinary folder renaming:
exports.createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;

  // Auto-generate slug if not provided
  if (!productData.slug && productData.title) {
    productData.slug = slugify(productData.title, { lower: true });
  }

  const tempProductId = productData.tempProductId;
  delete productData.tempProductId;

  const product = await db.create({
    model: Product,
    data: productData
  });

  // Rename Cloudinary folder from temp ID to actual product ID if images were uploaded
  if (tempProductId && tempProductId.startsWith('temp-')) {
    const oldFolder = `products/${tempProductId}`;
    const newFolder = `products/${product._id.toString()}`;
    
    const updates = await renameCloudinaryFolder(oldFolder, newFolder, product);
    
    if (updates) {
      // Update product with new image URLs and public_ids
      await db.findByIdAndUpdate({
        model: Product,
        id: product._id,
        data: updates
      });

      // Update the product object to return
      Object.assign(product, updates);
    }
  }

  res.status(201).json({
    status: "success",
    data: product,
  });
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


