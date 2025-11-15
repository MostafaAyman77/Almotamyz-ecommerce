// orderModel.js (updated)
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order must belong to user"],
    },
    cart: {
      type: mongoose.Schema.ObjectId,
      ref: "Cart",
      required: [true, "Order must reference a cart"],
    },
    coupon: { // Fixed typo
      type: mongoose.Schema.ObjectId,
      ref: "Coupon"
    },
    // Store cart items snapshot at time of order
    cartItems: [{
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      color: String
    }],
    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },
    totalOrderPrice: {
      type: Number,
      required: true,
    },
    totalPriceAfterDiscount: { // Added for discount tracking
      type: Number,
    },
    paymentMethodType: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    // Soft delete fields
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Populate relationships when querying
orderSchema.pre(/^find/, function (next) {
  // Only populate non-deleted documents
  this.find({ isDeleted: { $ne: true } });
  
  this.populate({
    path: "user",
    select: "name email phone",
  })
  .populate({
    path: "cart",
    select: "totalCartPrice",
  })
  .populate({
    path: "coupon",
    select: "name discount discountType",
  })
  .populate({
    path: "cartItems.product",
    select: "title imageCover price",
  });
  next();
});

module.exports = mongoose.model("Order", orderSchema);