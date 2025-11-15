// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.ObjectId,
//       ref: "User",
//       required: false,
//     },
//     guestId: {
//       type: String,
//       required: false,
//       index: true,
//     },

//     guestCustomer: {
//       name: {
//         type: String,
//         required: false,
//       },
//       email: {
//         type: String,
//         required: false,
//       },
//       phone: {
//         type: String,
//         required: false,
//       },
//     },
//     cartItems: [
//       {
//         product: {
//           type: mongoose.Schema.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         quantity: {
//           type: Number,
//           required: true,
//         },
//         color: String,
//         price: {
//           type: Number,
//           required: true,
//         },
//       },
//     ],
//     taxPrice: {
//       type: Number,
//       default: 0,
//     },
//     shippingPrice: {
//       type: Number,
//       default: 0,
//     },
//     totalOrderPrice: {
//       type: Number,
//       required: true,
//     },
//     paymentMethodType: {
//       type: String,
//       enum: ["card", "cash"],
//       default: "cash",
//     },
//     isPaid: {
//       type: Boolean,
//       default: false,
//     },
//     paidAt: Date,
//     isDelivered: {
//       type: Boolean,
//       default: false,
//     },
//     deliveredAt: Date,
//     orderStatus: {
//       type: String,
//       enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
//       default: "pending",
//     },
//     shippingAddress: {
//       details: {
//         type: String,
//         required: [true, "Shipping address details are required"],
//       },
//       phone: {
//         type: String,
//         required: [true, "Phone number is required"],
//       },
//       city: {
//         type: String,
//         required: [true, "City is required"],
//       },
//       postalCode: {
//         type: String,
//         required: false,
//         default: "",
//       },
//     },
//     couponDiscount: {
//       type: Number,
//       default: 0,
//     },
//     couponName: String,
//     paymentResult: {
//       id: String,
//       status: String,
//       update_time: String,
//       email_address: String,
//     },
//     paymentIntentId: {
//       type: String,
//     },
//   },
//   { timestamps: true }
// );

// // Ensure either user or guestId is present, and guest customer info for guest orders
// orderSchema.pre("save", function (next) {
//   if (!this.user && !this.guestId) {
//     return next(new Error("Order must have either user or guestId"));
//   }
//   if (this.user && this.guestId) {
//     return next(new Error("Order cannot have both user and guestId"));
//   }

//   // For guest orders, ensure guest customer information is provided
//   if (
//     this.guestId &&
//     (!this.guestCustomer ||
//       !this.guestCustomer.name ||
//       !this.guestCustomer.phone)
//   ) {
//     return next(
//       new Error("Guest orders must include customer name, email, and phone")
//     );
//   }

//   next();
// });

// orderSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "user",
//     select: "name email phone",
//   }).populate({
//     path: "cartItems.product",
//     select: "title imageCover",
//   });
//   next();
// });

// const Order = mongoose.model("Order", orderSchema);

// module.exports = Order;
