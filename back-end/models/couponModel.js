const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Coupon name is required'],
        unique: true,
        uppercase: true,
    },
    expire: {
        type: Date,
        required: [true, 'Coupon expire time is required'],
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: [true, 'Discount type is required'],
        default: 'percentage'
    },
    discount: {
        type: Number,
        required: [true, 'Coupon discount value is required'],
        validate: {
            validator: function(value) {
                if (this.discountType === 'percentage') {
                    return value >= 1 && value <= 100;
                } else {
                    return value > 0;
                }
            },
            message: 'Discount must be between 1-100 for percentage or greater than 0 for fixed amount'
        }
    },
    maxUses: {
        type: Number,
        default: null, // null means unlimited uses
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    minOrderAmount: {
        type: Number,
        default: 0,
    },
    maxDiscountAmount: {
        type: Number,
        default: null, // Only applicable for percentage discounts
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Check if coupon is valid
couponSchema.methods.isValid = function () {
    const now = new Date();
    return (
        this.isActive &&
        !this.isDeleted &&
        this.expire > now &&
        (this.maxUses === null || this.usedCount < this.maxUses)
    );
};

// Calculate discount amount
couponSchema.methods.calculateDiscount = function (totalAmount) {
    let discountAmount = 0;
    
    if (this.discountType === 'percentage') {
        discountAmount = (totalAmount * this.discount) / 100;
        
        // Apply maximum discount limit if set
        if (this.maxDiscountAmount && discountAmount > this.maxDiscountAmount) {
            discountAmount = this.maxDiscountAmount;
        }
    } else {
        // Fixed amount discount
        discountAmount = this.discount;
        
        // Ensure discount doesn't exceed total amount
        if (discountAmount > totalAmount) {
            discountAmount = totalAmount;
        }
    }
    
    return discountAmount;
};

// Increment used count
couponSchema.methods.incrementUsage = function () {
    this.usedCount += 1;
    return this.save();
};

couponSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        name: this.name,
        discountType: this.discountType,
        discount: this.discount,
        expire: this.expire,
        minOrderAmount: this.minOrderAmount,
        maxDiscountAmount: this.maxDiscountAmount,
        maxUses: this.maxUses,
        usedCount: this.usedCount,
        isActive: this.isActive
    };
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;