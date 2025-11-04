const slugify = require('slugify');
const asyncHandler = require('express-async-handler');
const ApiError = require("../utils/apiError");
const db = require("./DB/db.services");
const Brand = require("../models/brandModel");

// @desc    Get list of brands with advanced filtering
// @route   GET /api/v1/brands
// @access  Public
exports.getBrands = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        sort = 'name', 
        fields,
        keyword,
        ...otherFilters 
    } = req.query;
    
    // Build filter object
    let filter = { isDeleted: { $ne: true } };
    
    // Add other filters
    Object.keys(otherFilters).forEach(key => {
        if (otherFilters[key]) {
            filter[key] = otherFilters[key];
        }
    });
    
    // Handle search by keyword
    if (keyword) {
        filter.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { slug: { $regex: keyword, $options: 'i' } }
        ];
    }
    
    const result = await db.findWithPagination({
        model: Brand,
        filter,
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sort === 'latest' ? { createdAt: -1 } : { [sort]: 1 },
        select: fields || 'name slug image createdAt'
    });
    
    res.status(200).json({
        success: true,
        count: result.data.length,
        pagination: result.pagination,
        data: result.data
    });
});

// @desc    Get specific brand by id or slug
// @route   GET /api/v1/brands/:id
// @access  Public
exports.getBrand = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    
    // Check if it's a MongoDB ID or slug
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    
    // const filter = isMongoId ? { _id: id } : { slug: id };
    const filter =  {_id : id}
    filter.isDeleted = { $ne: true };
    
    const brand = await db.findOne({
        model: Brand,
        filter,
        options: { lean: true }
    });
    
    if (!brand) {
        return next(new ApiError(`No brand found with ${isMongoId ? 'id' : 'slug'} ${id}`, 404));
    }
    
    res.status(200).json({
        success: true,
        data: brand
    });
});

// @desc    Create brand
// @route   POST /api/v1/brands
// @access  Private/Admin
exports.createBrand = asyncHandler(async (req, res, next) => {
    const { name, slug, ...otherData } = req.body;
    
    // Check if brand already exists by name
    const existingBrandByName = await db.findOne({
        model: Brand,
        filter: { name }
    });
    
    if (existingBrandByName) {
        return next(new ApiError('Brand with this name already exists', 400));
    }
    
    // Check if brand already exists by slug
    const finalSlug = slug || slugify(name);
    const existingBrandBySlug = await db.findOne({
        model: Brand,
        filter: { slug: finalSlug }
    });
    
    if (existingBrandBySlug) {
        return next(new ApiError('Brand with this slug already exists', 400));
    }
    
    const brandData = {
        name,
        slug: finalSlug,
        ...otherData
    };
    
    const brand = await db.create({
        model: Brand,
        data: brandData
    });
    
    res.status(201).json({
        success: true,
        data: brand
    });
});

// @desc    Update brand
// @route   PUT /api/v1/brands/:id
// @access  Private/Admin
exports.updateBrand = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, slug, ...updateData } = req.body;
    
    // Check if brand exists
    const existingBrand = await db.findById({
        model: Brand,
        id
    });
    
    if (!existingBrand) {
        return next(new ApiError(`No brand found with id ${id}`, 404));
    }
    
    // If name is being updated, check for duplicates
    if (name && name !== existingBrand.name) {
        const duplicateBrand = await db.findOne({
            model: Brand,
            filter: { 
                name,
                _id: { $ne: id }
            }
        });
        
        if (duplicateBrand) {
            return next(new ApiError('Brand with this name already exists', 400));
        }
        
        updateData.name = name;
        // Auto-generate slug from name if not provided
        updateData.slug = slug || slugify(name);
    }
    
    // If slug is being updated independently, check for duplicates
    if (slug && slug !== existingBrand.slug) {
        const duplicateSlug = await db.findOne({
            model: Brand,
            filter: { 
                slug,
                _id: { $ne: id }
            }
        });
        
        if (duplicateSlug) {
            return next(new ApiError('Brand with this slug already exists', 400));
        }
        
        updateData.slug = slug;
    }
    
    const brand = await db.findByIdAndUpdate({
        model: Brand,
        id,
        data: updateData
    });
    
    res.status(200).json({
        success: true,
        data: brand
    });
});

// @desc    Delete brand (soft delete)
// @route   DELETE /api/v1/brands/:id
// @access  Private/Admin
exports.deleteBrand = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    
    const brand = await db.softDelete({
        model: Brand,
        filter: { _id: id }
    });
    
    if (!brand) {
        return next(new ApiError(`No brand found with id ${id}`, 404));
    }
    
    res.status(200).json({
        success: true,
        message: 'Brand deleted successfully'
    });
});

// @desc    Restore soft-deleted brand
// @route   PATCH /api/v1/brands/:id/restore
// @access  Private/Admin
exports.restoreBrand = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    
    const brand = await db.restoreSoftDelete({
        model: Brand,
        filter: { _id: id }
    });
    
    if (!brand) {
        return next(new ApiError(`No deleted brand found with id ${id}`, 404));
    }
    
    res.status(200).json({
        success: true,
        message: 'Brand restored successfully',
        data: brand
    });
});

// @desc    Get deleted brands (Admin only)
// @route   GET /api/v1/brands/deleted/all
// @access  Private/Admin
exports.getDeletedBrands = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    
    const result = await db.findWithPagination({
        model: Brand,
        filter: { isDeleted: true },
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { deletedAt: -1 }
    });
    
    res.status(200).json({
        success: true,
        count: result.data.length,
        pagination: result.pagination,
        data: result.data
    });
});