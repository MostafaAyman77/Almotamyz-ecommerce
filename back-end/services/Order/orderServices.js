const asyncHandler = require("express-async-handler");
const ApiError = require("./../../utils/apiError");
const PaymobService = require("./../../services/paymentServices");

const Order = require("./../../models/order/orderModel");
const Cart = require("./../../models/cartModel");
const Product = require("./../../models/productModel");

const paymobService = new PaymobService();




// ============================================================
// PAYMOB CALLBACK 1: Transaction Processed (POST)
// ============================================================
// This is the SOURCE OF TRUTH for payment status
// Server-to-server communication from Paymob
// Use this to UPDATE your database

// @desc    Paymob Transaction Processed Callback (POST)
// @route   POST /api/v1/orders/paymob-callback
// @access  Public (but verified with HMAC)
exports.paymobCallback = asyncHandler(async (req, res, next) => {
  console.log("=".repeat(60));
  console.log("PAYMOB PROCESSED CALLBACK RECEIVED");
  console.log("=".repeat(60));
  console.log("Full Request Body:", JSON.stringify(req.body, null, 2));

  // Extract callback data
  const callbackData = req.body.obj || req.body;
  const receivedHmac = req.body.hmac;

  // 1) VERIFY HMAC SIGNATURE (Critical for security!)
  const isValid = paymobService.verifyCallback(callbackData, receivedHmac);
  if (!isValid) {
    console.error("❌ HMAC VERIFICATION FAILED - Callback rejected");
    console.error("Received HMAC:", receivedHmac);
    // Return 400 but don't throw error (Paymob expects response)
    return res.status(400).json({ 
      status: "error", 
      message: "Invalid callback signature" 
    });
  }
  console.log("✅ HMAC verified successfully");

  // 2) EXTRACT ORDER REFERENCE
  // merchant_order_id is YOUR MongoDB Order ID
  const merchantOrderId = callbackData.order?.merchant_order_id;
  
  if (!merchantOrderId) {
    console.error("❌ No merchant_order_id found in callback");
    return res.status(400).json({ 
      status: "error", 
      message: "Missing order reference" 
    });
  }

  console.log("🔍 Looking for order:", merchantOrderId);

  // 3) FIND ORDER IN DATABASE
  const order = await Order.findById(merchantOrderId);
  
  if (!order) {
    console.error(`❌ Order not found: ${merchantOrderId}`);
    return res.status(404).json({ 
      status: "error", 
      message: "Order not found" 
    });
  }

  console.log("📦 Order found:", {
    orderId: order._id,
    currentStatus: order.paymentStatus,
    isPaid: order.isPaid,
    amount: order.totalOrderPrice
  });

  // 4) PREVENT DUPLICATE PROCESSING
  // If order is already paid, don't process again
  if (order.isPaid && order.paymentStatus === "paid") {
    console.log("⚠️ Order already processed - skipping duplicate callback");
    return res.status(200).json({ 
      status: "success", 
      message: "Already processed" 
    });
  }

  // 5) EXTRACT PAYMENT STATUS
  const transactionId = callbackData.id;
  const isSuccess = callbackData.success === "true" || callbackData.success === true;
  const isPending = callbackData.pending === "true" || callbackData.pending === true;
  const amountCents = parseInt(callbackData.amount_cents);
  const errorOccured = callbackData.error_occured === "true" || callbackData.error_occured === true;

  console.log("💳 Payment Details:", {
    transactionId,
    success: isSuccess,
    pending: isPending,
    amountCents,
    errorOccured,
    expectedAmount: order.totalOrderPrice * 100
  });

  // 6) VERIFY AMOUNT MATCHES
  const expectedAmountCents = Math.round(order.totalOrderPrice * 100);
  if (amountCents !== expectedAmountCents) {
    console.error("❌ Amount mismatch!", {
      received: amountCents,
      expected: expectedAmountCents
    });
    order.paymentStatus = "failed";
    order.paymentError = "Amount mismatch";
    await order.save();
    return res.status(400).json({ 
      status: "error", 
      message: "Amount mismatch" 
    });
  }

  // 7) UPDATE ORDER BASED ON PAYMENT STATUS
  if (isSuccess && !isPending && !errorOccured) {
    // ✅ PAYMENT SUCCESSFUL
    console.log("✅ PAYMENT SUCCESSFUL");
    
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentStatus = "paid";
    order.orderStatus = "processing";
    order.paymobTransactionId = transactionId;
    
    // Store transaction details for reconciliation
    order.transactionDetails = {
      id: transactionId,
      amount_cents: amountCents,
      currency: callbackData.currency,
      payment_method: callbackData.source_data?.type,
      card_last_4: callbackData.source_data?.pan,
      is_3d_secure: callbackData.is_3d_secure,
      processed_at: callbackData.created_at
    };

    // Decrement product quantity and increment sold count
    if (order.cartItems && order.cartItems.length > 0) {
      const bulkOption = order.cartItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { 
            $inc: { 
              quantity: -item.quantity, 
              sold: +item.quantity 
            } 
          },
        },
      }));
      
      await Product.bulkWrite(bulkOption, {});
      console.log(`📦 Updated inventory for ${order.cartItems.length} products`);
    }

    // Clear the user's cart
    if (order.cart) {
      await Cart.findByIdAndDelete(order.cart);
      console.log("🗑️ Cart cleared");
    }

    console.log("✅ Order updated successfully:", {
      orderId: order._id,
      status: order.paymentStatus,
      transactionId: order.paymobTransactionId
    });

  } else if (!isSuccess && !isPending) {
    // ❌ PAYMENT FAILED
    console.log("❌ PAYMENT FAILED");
    
    order.paymentStatus = "failed";
    order.paymobTransactionId = transactionId;
    order.paymentError = callbackData.data?.message || "Payment declined";
    
    console.log("❌ Order marked as failed:", {
      orderId: order._id,
      reason: order.paymentError
    });

  } else if (isPending) {
    // ⏳ PAYMENT PENDING (e.g., 3DS authentication)
    console.log("⏳ PAYMENT PENDING");
    
    order.paymentStatus = "pending";
    order.paymobTransactionId = transactionId;
    
    console.log("⏳ Order remains pending:", {
      orderId: order._id,
      reason: "Awaiting final status"
    });
  }

  // 8) SAVE ORDER TO DATABASE
  await order.save();

  // 9) OPTIONAL: Send notifications
  // TODO: Send email to customer
  // TODO: Send notification to admin
  // TODO: Trigger webhooks to other systems

  console.log("=".repeat(60));
  console.log("CALLBACK PROCESSING COMPLETED");
  console.log("=".repeat(60));

  // Return 200 to acknowledge receipt to Paymob
  res.status(200).json({ status: "success" });
});

// ============================================================
// PAYMOB CALLBACK 2: Transaction Response (GET)
// ============================================================
// This redirects the USER back to your website
// Use this to SHOW a success/failure page
// DO NOT use this to update payment status (use POST callback)

// @desc    Paymob Transaction Response Callback (GET)
// @route   GET /api/v1/orders/paymob-response
// @access  Public (but verified with HMAC)
exports.paymobResponse = asyncHandler(async (req, res, next) => {
  console.log("=".repeat(60));
  console.log("PAYMOB RESPONSE REDIRECT RECEIVED");
  console.log("=".repeat(60));
  console.log("Query Parameters:", req.query);

  const { 
    success, 
    merchant_order_id, 
    hmac,
    id: transactionId,
    pending 
  } = req.query;

  // 1) VERIFY HMAC SIGNATURE
  const isValid = paymobService.verifyResponseCallback(req.query);
  
  if (!isValid) {
    console.error("❌ HMAC verification failed for response callback");
    // Redirect to error page with reason
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/error?reason=invalid_signature`
    );
  }
  console.log("✅ HMAC verified for response callback");

  // 2) FIND ORDER (optional - just for display)
  let order = null;
  if (merchant_order_id) {
    order = await Order.findById(merchant_order_id);
    console.log(order ? "✅ Order found" : "⚠️ Order not found");
  }

  // 3) REDIRECT USER BASED ON STATUS
  const isPending = pending === "true";
  const isSuccess = success === "true";

  if (isPending) {
    // Payment is still processing (3DS, etc.)
    console.log("⏳ Redirecting to pending page");
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/pending?orderId=${merchant_order_id}&transactionId=${transactionId}`
    );
  }

  if (isSuccess) {
    // Payment successful - show success page
    console.log("✅ Redirecting to success page");
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/success?orderId=${merchant_order_id}&transactionId=${transactionId}`
    );
  } else {
    // Payment failed - show failure page
    console.log("❌ Redirecting to failure page");
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/failed?orderId=${merchant_order_id}&transactionId=${transactionId}`
    );
  }
});





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
    order._id,
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