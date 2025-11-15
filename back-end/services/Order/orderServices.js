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

// Create order from cart
exports.createOrder = async (userId, orderData) => {
  const {coupon: couponCode, shippingAddress, paymentMethodType } = orderData;
  
  // Get user's cart
  const cart = await findOne({
    model: Cart,
    filter: {user: userId },
    options: { populate: "cartItems.product" }
  });
  
  const cartId = cart._id;
  
  if (!cart) throw new Error("Cart not found");
  if (cart.cartItems.length === 0) throw new Error("Cart is empty");
  
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
  
  // Create order
  const order = await create({
    model: Order,
    data: {
      user: userId,
      cart: cartId,
      coupon: coupon?._id,
      cartItems: cart.cartItems,
      shippingAddress,
      paymentMethodType: paymentMethodType || "cash",
      totalOrderPrice: cart.totalCartPrice,
      totalPriceAfterDiscount: totalOrderPrice
    }
  });
  
  // Clear cart
  await softDelete({
    model: Cart,
    filter: { _id: cartId },
  });
  
  return order;
};

// Get user's orders
exports.getUserOrders = async (userId, page = 1, limit = 10) => {
  return await findWithPagination({
    model: Order,
    filter: { user: userId },
    sort: { createdAt: -1 },
    page: parseInt(page),
    limit: parseInt(limit),
    options: { populate: "cartItems.product coupon" }
  });
};

// Get single order
exports.getOrder = async (orderId, userId = null) => {
  const filter = { _id: orderId };
  if (userId) filter.user = userId; // Users can only see their own orders
  
  return await findOne({
    model: Order,
    filter,
    options: { populate: "cartItems.product coupon" }
  });
};

// Get all orders (admin)
exports.getAllOrders = async (filters = {}, page = 1, limit = 10) => {
  const { status, paymentStatus } = filters;
  
  let filter = {};
  if (status) filter.orderStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  
  return await findWithPagination({
    model: Order,
    filter,
    sort: { createdAt: -1 },
    page: parseInt(page),
    limit: parseInt(limit),
    options: { populate: "user cartItems.product coupon" }
  });
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
  
  return await findByIdAndUpdate({
    model: Order,
    id: orderId,
    data: updateData,
    options: { populate: "cartItems.product coupon" }
  });
};

// Update payment status
exports.updatePaymentStatus = async (orderId, paymentStatus) => {
  const updateData = { 
    paymentStatus,
    isPaid: paymentStatus === "paid",
    paidAt: paymentStatus === "paid" ? new Date() : undefined
  };
  
  return await findByIdAndUpdate({
    model: Order,
    id: orderId,
    data: updateData,
    options: { populate: "cartItems.product coupon" }
  });
};

// Cancel order
exports.cancelOrder = async (orderId, userId) => {
  return await findByIdAndUpdate({
    model: Order,
    id: orderId,
    data: { 
      orderStatus: "cancelled",
      paymentStatus: "refunded"
    },
    options: { populate: "cartItems.product coupon" }
  });
};

// Delete order (soft delete)
exports.deleteOrder = async (orderId, userId = null) => {
  const filter = { _id: orderId };
  if (userId) filter.user = userId;
  
  return await softDelete({
    model: Order,
    filter,
    options: { populate: "cartItems.product coupon" }
  });
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


exports.getMyOrders = async (req, res, next)=> {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await orderServices.getUserOrders(req.user._id, page, limit);
    
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
}