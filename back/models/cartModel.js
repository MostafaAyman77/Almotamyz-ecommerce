const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        color: String,
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalCartPrice: {
      type: Number,
      default: 0,
    },
    totalPriceAfterDiscount: Number,
    // Support both authenticated users and guest users
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: false, // Make it optional for guest carts
    },
    guestId: {
      type: String,
      required: false, // For guest carts
      index: true,
    },
  },
  { timestamps: true }
);

// Ensure either user or guestId is present
cartSchema.pre("save", function (next) {
  if (!this.user && !this.guestId) {
    return next(new Error("Cart must have either user or guestId"));
  }
  if (this.user && this.guestId) {
    return next(new Error("Cart cannot have both user and guestId"));
  }
  next();
});

// Populate product details when querying cart
cartSchema.pre(/^find/, function (next) {
  this.populate({
    path: "cartItems.product",
    select: "title imageCover price",
  });
  next();
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
