const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // Direct reference to user (from cart)
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order must belong to user"],
    },
    // Reference to the cart that was used to create this order
    cart: {
      type: mongoose.Schema.ObjectId,
      ref: "Cart",
      required: [true, "Order must reference a cart"],
    },
    // Snapshot of cart items at time of order (in case cart is deleted/modified)
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        color: String,
        price: Number,
      },
    ],
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
  },
  { timestamps: true }
);

// Populate relationships when querying
orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email phone",
  })
    .populate({
      path: "cart",
      select: "totalCartPrice totalPriceAfterDiscount",
    })
    .populate({
      path: "cartItems.product",
      select: "title imageCover price",
    });
  next();
});

module.exports = mongoose.model("Order", orderSchema);