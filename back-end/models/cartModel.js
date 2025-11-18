const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, "Quantity cannot be less than 1"],
  },
  price: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    required: false,
  }
});

const cartSchema = new mongoose.Schema(
  {
    cartItems: [cartItemSchema],
    totalCartPrice: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
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
  },
  { timestamps: true }
);

// Static method to calculate total price
cartSchema.statics.calculateTotalPrice = function(cartItems) {
  return cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Pre-save middleware to calculate total price
cartSchema.pre('save', function(next) {
  this.totalCartPrice = this.constructor.calculateTotalPrice(this.cartItems);
  next();
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;