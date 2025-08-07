const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Coupon name is required"],
      unique: true,
      uppercase: true,
    },
    expire: {
      type: Date,
      required: [true, "Coupon expire time is required"],
    },
    discount: {
      type: Number,
      required: [true, "Coupon discount value is required"],
      min: [1, "Discount must be at least 1%"],
      max: [100, "Discount cannot exceed 100%"],
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
      default: null, // null means no maximum discount limit
    },
    applicableProducts: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    applicableCategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
      },
    ],
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Check if coupon is valid
couponSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    this.expire > now &&
    (this.maxUses === null || this.usedCount < this.maxUses)
  );
};

// Increment used count
couponSchema.methods.incrementUsage = function () {
  this.usedCount += 1;
  return this.save();
};

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
