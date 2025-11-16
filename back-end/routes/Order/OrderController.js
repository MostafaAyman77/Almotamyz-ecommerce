const orderServices = require("../../services/Order/orderServices.js");
exports.createOrder = async function(req, res, next) {
  try {
    const order = await orderServices.createOrder(req.user._id, req.body);
    res.status(201).json({
      status: "success",
      data: { order }
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
}

exports.getMyOrders = async function (req, res, next) {
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

exports.getOrder = async function (req, res, next) {
  try {
    const order = await orderServices.getOrder(req.params.id, req.user._id);
    
    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found"
      });
    }
    
    res.status(200).json({
      status: "success",
      data: { order }
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
}

exports.cancelOrder= async function (req, res, next) {
  try {
    const order = await orderServices.cancelOrder(req.params.id, req.user._id);
    
    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found"
      });
    }
    
    res.status(200).json({
      status: "success",
      data: { order }
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
}

exports.getAllOrders = async function (req, res, next) {
  try {
    const { page = 1, limit = 10, status, paymentStatus } = req.query;
    const filters = { status, paymentStatus };
    
    const result = await orderServices.getAllOrders(filters, page, limit);
    
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

exports.updateOrderStatus = async function (req, res, next) {
  try {
    const { status } = req.body;
    const order = await orderServices.updateOrderStatus(req.params.id, status);
    
    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found"
      });
    }
    
    res.status(200).json({
      status: "success",
      data: { order }
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
}

exports.updatePaymentStatus = async function (req, res, next) {
  try {
    const { paymentStatus } = req.body;
    const order = await orderServices.updatePaymentStatus(req.params.id, paymentStatus);
    
    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found"
      });
    }
    
    res.status(200).json({
      status: "success",
      data: { order }
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
}

exports.deleteOrder = async function (req, res, next) {
  try {
    const order = await orderServices.deleteOrder(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found"
      });
    }
    
    res.status(200).json({
      status: "success",
      message: "Order deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
}

exports.getOrderStats = async function(req, res, next) {
  try {
    const stats = await orderServices.getOrderStats();
    
    res.status(200).json({
      status: "success",
      data: { stats }
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
}