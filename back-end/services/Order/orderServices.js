const asyncHandler = require("express-async-handler");
const ApiError = require("./../../utils/apiError");
const PaymobService = require("./../../services/paymentServices");

const Order = require("./../../models/order/orderModel");
const Cart = require("./../../models/cartModel");
const Product = require("./../../models/productModel");

const paymobService = new PaymobService();

// @desc    Create cash order
// @route   POST /api/v1/orders/:cartId
// @access  Protected/User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no cart with id ${req.params.cartId}`, 404)
    );
  }

  // Check if cart belongs to user
  if (cart.user.toString() !== req.user._id.toString()) {
    return next(new ApiError("This cart does not belong to you", 403));
  }

  // 2) Get order price depend on cart price "Check if coupon applied"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create order with default paymentMethodType cash
  const order = await Order.create({
    user: req.user._id,
    cart: cart._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
    paymentMethodType: "cash",
  });

  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({ status: "success", data: order });
});

// @desc    Initiate online payment (Paymob Card)
// @route   POST /api/v1/orders/:cartId/pay-card
// @access  Protected/User
exports.createCardPayment = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no cart with id ${req.params.cartId}`, 404)
    );
  }

  // Check if cart belongs to user
  if (cart.user.toString() !== req.user._id.toString()) {
    return next(new ApiError("This cart does not belong to you", 403));
  }

  // 2) Get order price
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create order with pending payment status
  const order = await Order.create({
    user: req.user._id,
    cart: cart._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
    paymentMethodType: "card",
    paymentStatus: "pending",
  });

  // 4) Prepare billing data for Paymob
  const billingData = {
    first_name: req.user.name.split(" ")[0] || "Customer",
    last_name: req.user.name.split(" ")[1] || "User",
    email: req.user.email,
    phone_number: req.body.shippingAddress.phone,
    apartment: "NA",
    floor: "NA",
    street: req.body.shippingAddress.details || "NA",
    building: "NA",
    shipping_method: "NA",
    postal_code: req.body.shippingAddress.postalCode || "NA",
    city: req.body.shippingAddress.city || "NA",
    country: "EG",
    state: "NA",
  };

  // 5) Initiate Paymob payment
  const paymentResult = await paymobService.initiateCardPayment(
    totalOrderPrice,
    billingData
  );

  if (!paymentResult.success) {
    // Delete order if payment initiation failed
    await Order.findByIdAndDelete(order._id);
    return next(new ApiError(paymentResult.error, 500));
  }

  // 6) Update order with Paymob order ID
  order.paymobOrderId = paymentResult.orderId;
  await order.save();

  res.status(201).json({
    status: "success",
    data: {
      order,
      paymentUrl: paymentResult.iframeUrl,
      paymentToken: paymentResult.paymentToken,
    },
  });
});

// @desc    Initiate wallet payment (Paymob Wallet)
// @route   POST /api/v1/orders/:cartId/pay-wallet
// @access  Protected/User
exports.createWalletPayment = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no cart with id ${req.params.cartId}`, 404)
    );
  }

  // Check if cart belongs to user
  if (cart.user.toString() !== req.user._id.toString()) {
    return next(new ApiError("This cart does not belong to you", 403));
  }

  // 2) Get order price
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create order with pending payment status
  const order = await Order.create({
    user: req.user._id,
    cart: cart._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
    paymentMethodType: "card",
    paymentStatus: "pending",
  });

  // 4) Prepare billing data for Paymob
  const billingData = {
    first_name: req.user.name.split(" ")[0] || "Customer",
    last_name: req.user.name.split(" ")[1] || "User",
    email: req.user.email,
    phone_number: req.body.phone,
    apartment: "NA",
    floor: "NA",
    street: req.body.shippingAddress.details || "NA",
    building: "NA",
    shipping_method: "NA",
    postal_code: req.body.shippingAddress.postalCode || "NA",
    city: req.body.shippingAddress.city || "NA",
    country: "EG",
    state: "NA",
  };

  // 5) Initiate Paymob wallet payment
  const paymentResult = await paymobService.initiateWalletPayment(
    totalOrderPrice,
    billingData,
    req.body.phone
  );

  if (!paymentResult.success) {
    // Delete order if payment initiation failed
    await Order.findByIdAndDelete(order._id);
    return next(new ApiError(paymentResult.error, 500));
  }

  // 6) Update order with Paymob order ID
  order.paymobOrderId = paymentResult.orderId;
  await order.save();

  res.status(201).json({
    status: "success",
    data: {
      order,
      redirectUrl: paymentResult.redirectUrl,
    },
  });
});

// @desc    Paymob payment callback
// @route   POST /api/v1/orders/paymob-callback
// @access  Public
exports.paymobCallback = asyncHandler(async (req, res, next) => {
  const callbackData = req.body.obj || req.body;

  // 1) Verify callback authenticity
  const isValid = paymobService.verifyCallback(callbackData);
  if (!isValid) {
    return next(new ApiError("Invalid callback signature", 400));
  }

  // 2) Find order by Paymob order ID
  const order = await Order.findOne({ paymobOrderId: callbackData.order });
  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  // 3) Update order based on payment status
  if (callbackData.success === "true" || callbackData.success === true) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentStatus = "paid";
    order.orderStatus = "processing";

    // Decrement product quantity, increment sold
    const bulkOption = order.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // Clear the cart
    await Cart.findByIdAndDelete(order.cart);
  } else {
    order.paymentStatus = "failed";
  }

  await order.save();

  res.status(200).json({ status: "success" });
});

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Protected/User-Admin-Manager
exports.getAllOrders = asyncHandler(async (req, res, next) => {
  let filter = {};
  
  // If user is not admin, show only their orders
  if (req.user.role === "user") {
    filter = { user: req.user._id };
  }

  const orders = await Order.find(filter);

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: orders,
  });
});

// @desc    Get specific order
// @route   GET /api/v1/orders/:id
// @access  Protected/User-Admin-Manager
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError(`No order found with id ${req.params.id}`, 404));
  }

  // Check if user owns this order (if not admin)
  if (
    req.user.role === "user" &&
    order.user._id.toString() !== req.user._id.toString()
  ) {
    return next(new ApiError("You are not authorized to view this order", 403));
  }

  res.status(200).json({
    status: "success",
    data: order,
  });
});

// @desc    Update order to paid (Manual - Admin only)
// @route   PUT /api/v1/orders/:id/pay
// @access  Protected/Admin-Manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError(`No order found with id ${req.params.id}`, 404));
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentStatus = "paid";
  order.orderStatus = "processing";

  const updatedOrder = await order.save();

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// @desc    Update order to delivered
// @route   PUT /api/v1/orders/:id/deliver
// @access  Protected/Admin-Manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError(`No order found with id ${req.params.id}`, 404));
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.orderStatus = "delivered";

  const updatedOrder = await order.save();

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// @desc    Cancel order
// @route   PUT /api/v1/orders/:id/cancel
// @access  Protected/User-Admin-Manager
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError(`No order found with id ${req.params.id}`, 404));
  }

  // Check if user owns this order (if not admin)
  if (
    req.user.role === "user" &&
    order.user._id.toString() !== req.user._id.toString()
  ) {
    return next(
      new ApiError("You are not authorized to cancel this order", 403)
    );
  }

  // Can only cancel if not delivered
  if (order.isDelivered) {
    return next(new ApiError("Cannot cancel delivered order", 400));
  }

  order.orderStatus = "cancelled";

  // If order was paid, update payment status
  if (order.isPaid) {
    order.paymentStatus = "refunded";
  }

  const updatedOrder = await order.save();

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// @desc    Delete order
// @route   DELETE /api/v1/orders/:id
// @access  Protected/Admin
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    return next(new ApiError(`No order found with id ${req.params.id}`, 404));
  }

  res.status(204).send();
});

// @desc    Paymob payment response (User Redirect - GET)
// @route   GET /api/v1/orders/paymob-response
// @access  Public
exports.paymobResponse = asyncHandler(async (req, res, next) => {
  console.log("Paymob Response Redirect:", req.query);

  const { success, merchant_order_id, hmac } = req.query;

  // 1) Verify HMAC
  const isValid = paymobService.verifyResponseCallback(req.query);
  if (!isValid) {
    // Redirect to failure page
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=invalid_signature`);
  }

  // 2) Find order
  const order = await Order.findById(merchant_order_id);
  if (!order) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=order_not_found`);
  }

  // 3) Redirect based on success status
  if (success === "true") {
    // Redirect to success page
    res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${order._id}`);
  } else {
    // Redirect to failure page
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?orderId=${order._id}`);
  }
});

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Protected/User-Admin-Manager
exports.getAllOrders = asyncHandler(async (req, res, next) => {
  let filter = {};
  
  // If user is not admin, show only their orders
  if (req.user.role === "user") {
    filter = { user: req.user._id };
  }

  const orders = await Order.find(filter)
    .populate("user", "name email")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: orders,
  });
});