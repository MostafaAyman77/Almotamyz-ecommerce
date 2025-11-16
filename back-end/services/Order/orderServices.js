const Order = require("../../models/order/orderModel.js");
const Cart = require("../../models/cartModel");
const Coupon = require("../../models/couponModel");
const {
  create,
  findOne,
  findById,
  update,
  findByIdAndUpdate,
  findWithPagination,
  softDelete,
  aggregate
} = require("./../DB/db.services.js");

// 🎯 COMPRESSION UTILITY FUNCTIONS

// Compress cart items for storage (removes full product objects, keeps only IDs)
const compressCartItemsForStorage = (cartItems) => {
  return cartItems.map(item => ({
    product: item.product._id, // Store only product ID
    quantity: item.quantity,
    price: item.price,
    color: item.color,
  }));
};

// Compress order response for API (removes unwanted fields from populated products)
const compressOrderResponse = (order) => {
  if (!order) return order;
  
  const compressedOrder = order.toObject ? order.toObject() : { ...order };
  
  if (compressedOrder.cartItems) {
    compressedOrder.cartItems = compressedOrder.cartItems.map(item => {
      const compressedItem = {
        _id: item._id,
        product: item.product?._id || item.product,
        quantity: item.quantity,
        price: item.price,
        color: item.color
      };    
      return compressedItem;
    });
  }
  
  return compressedOrder;
};

// Compress multiple orders for API response
const compressOrdersResponse = (orders) => {
  if (!orders) return orders;
  
  if (Array.isArray(orders)) {
    return orders.map(order => compressOrderResponse(order));
  }
  
  if (orders.data && Array.isArray(orders.data)) {
    return {
      ...orders,
      data: orders.data.map(order => compressOrderResponse(order))
    };
  }
  
  return compressOrderResponse(orders);
};

// 🎯 ORDER SERVICES WITH COMPRESSION

// Create order from cart
exports.createOrder = async (userId, orderData) => {
  const { coupon: couponCode, shippingAddress, paymentMethodType } = orderData;

  // Get user's cart
  const cart = await findOne({
    model: Cart,
    filter: { user: userId },
    options: { populate: "cartItems.product" }
  });

  if (!cart) throw new Error("Cart not found");
  if (cart.cartItems.length === 0) throw new Error("Cart is empty");

  const cartId = cart._id;
  
  // Compress cart items before storing
  const compressedCartItems = compressCartItemsForStorage(cart.cartItems);

  let totalOrderPrice = cart.totalCartPrice;
  let coupon = null;
  let discountAmount = 0;

  // Apply coupon if provided
  if (couponCode) {
    coupon = await findOne({
      model: Coupon,
      filter: { name: couponCode.toUpperCase(), isDeleted: { $ne: true } }
    });

    if (!coupon || !coupon.isValid()) {
      throw new Error("Invalid coupon");
    }

    if (totalOrderPrice < coupon.minOrderAmount) {
      throw new Error(`Minimum order amount is ${coupon.minOrderAmount}`);
    }

    discountAmount = coupon.calculateDiscount(totalOrderPrice);
    totalOrderPrice -= discountAmount;
    await coupon.incrementUsage();
  }

  // Create order with compressed data
  const order = await create({
    model: Order,
    data: {
      user: userId,
      cart: cartId,
      coupon: coupon?._id,
      cartItems: compressedCartItems,
      shippingAddress,
      paymentMethodType: paymentMethodType || "cash",
      totalOrderPrice: cart.totalCartPrice,
      totalPriceAfterDiscount: totalOrderPrice,
      discountAmount
    }
  });

  // Clear cart
  await softDelete({
    model: Cart,
    filter: { _id: cartId },
  });

  return compressOrderResponse(order);
};

// Get user's orders
exports.getUserOrders = async (userId, page = 1, limit = 10) => {
  const result = await findWithPagination({
    model: Order,
    filter: { user: userId },
    sort: { createdAt: -1 },
    page: parseInt(page),
    limit: parseInt(limit),
    options: { populate: "cartItems.product coupon" }
  });

  return compressOrdersResponse(result);
};

// Get single order
exports.getOrder = async (orderId, userId = null) => {
  const filter = { _id: orderId };
  if (userId) filter.user = userId;

  const order = await findOne({
    model: Order,
    filter,
    options: { populate: "cartItems.product coupon" }
  });

  return compressOrderResponse(order);
};

// Get all orders (admin)
exports.getAllOrders = async (filters = {}, page = 1, limit = 10) => {
  const { status, paymentStatus } = filters;

  let filter = {};
  if (status) filter.orderStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const result = await findWithPagination({
    model: Order,
    filter,
    sort: { createdAt: -1 },
    page: parseInt(page),
    limit: parseInt(limit),
    options: { populate: "user cartItems.product coupon" }
  });

  return compressOrdersResponse(result);
};

// Update order status
exports.updateOrderStatus = async (orderId, status, userId = null) => {
  const filter = { _id: orderId };
  if (userId) filter.user = userId;

  const updateData = { orderStatus: status };

  if (status === "delivered") {
    updateData.isDelivered = true;
    updateData.deliveredAt = new Date();
  }

  if (status === "paid") {
    updateData.isPaid = true;
    updateData.paidAt = new Date();
    updateData.paymentStatus = "paid";
  }

  const order = await findByIdAndUpdate({
    model: Order,
    id: orderId,
    data: updateData,
    options: { populate: "cartItems.product coupon" }
  });

  return compressOrderResponse(order);
};

// Update payment status
exports.updatePaymentStatus = async (orderId, paymentStatus) => {
  const updateData = {
    paymentStatus,
    isPaid: paymentStatus === "paid",
    paidAt: paymentStatus === "paid" ? new Date() : undefined
  };

  const order = await findByIdAndUpdate({
    model: Order,
    id: orderId,
    data: updateData,
    options: { populate: "cartItems.product coupon" }
  });

  return compressOrderResponse(order);
};

// Cancel order
exports.cancelOrder = async (orderId, userId) => {
  const order = await findByIdAndUpdate({
    model: Order,
    id: orderId,
    data: {
      orderStatus: "cancelled",
      paymentStatus: "refunded"
    },
    options: { populate: "cartItems.product coupon" }
  });

  return compressOrderResponse(order);
};

// Delete order (soft delete)
exports.deleteOrder = async (orderId, userId = null) => {
  const filter = { _id: orderId };
  if (userId) filter.user = userId;

  const order = await softDelete({
    model: Order,
    filter,
    options: { populate: "cartItems.product coupon" }
  });

  return compressOrderResponse(order);
};

// Get order statistics
exports.getOrderStats = async () => {
  const pipeline = [
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totalPriceAfterDiscount" },
        averageOrderValue: { $avg: "$totalPriceAfterDiscount" },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] }
        },
        completedOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] }
        }
      }
    }
  ];

  const result = await aggregate({
    model: Order,
    pipeline
  });

  return result[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    completedOrders: 0
  };
};

// Get my orders (for route handler)
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await exports.getUserOrders(req.user._id, page, limit);

    res.status(200).json({
      status: "success",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
};

// 🎯 EXPORT COMPRESSION FUNCTIONS FOR USE IN OTHER FILES
exports.compressCartItemsForStorage = compressCartItemsForStorage;
exports.compressOrderResponse = compressOrderResponse;
exports.compressOrdersResponse = compressOrdersResponse;