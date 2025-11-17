const orderServices = require("../../services/Order/orderServices.js");
const PaymobService = require("../../services/paymentServices.js");
exports.createOrder = async function (req, res, next) {
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

exports.cancelOrder = async function (req, res, next) {
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

exports.getOrderStats = async function (req, res, next) {
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


exports.createOrderWithPayment = async function (req, res, next) {
  try {
    const { paymentMethod = 'card', phoneNumber } = req.body;

    const result = await orderServices.createOrderWithPaymob(
      req.user._id,
      req.body,
      paymentMethod
    );

    res.status(201).json({
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

exports.paymobCallback = async function (req, res, next) {
  try {
    // ⚠️ Verify HMAC for security (this prevents fake redirects)
    const paymobService = new PaymobService();
    const isValid = paymobService.verifyCallback(req.query);

    if (!isValid) {PaymobService.verifyTransactionResponse
      console.error('Invalid HMAC in callback - possible tampering');
      const errorUrl = `${process.env.FRONTEND_URL}/order-error?message=${encodeURIComponent('Invalid payment verification')}`;
      return res.redirect(errorUrl);
    }

    const { success, pending, order: paymobOrderId, id: transactionId } = req.query;

    // Find order by payment reference
    const order = await orderServices.getOrderByPaymentReference(paymobOrderId);

    if (!order) {
      const errorUrl = `${process.env.FRONTEND_URL}/order-error?message=${encodeURIComponent('Order not found')}`;
      return res.redirect(errorUrl);
    }

    // Redirect based on transaction status
    if (success === 'true' && pending === 'false') {
      // Payment successful
      const successUrl = `${process.env.FRONTEND_URL}/order-success?orderId=${order._id}&transactionId=${transactionId}`;
      return res.redirect(successUrl);
    } else if (pending === 'true') {
      // Payment pending
      const pendingUrl = `${process.env.FRONTEND_URL}/order-pending?orderId=${order._id}`;
      return res.redirect(pendingUrl);
    } else {
      // Payment failed
      const failUrl = `${process.env.FRONTEND_URL}/order-failed?orderId=${order._id}`;
      return res.redirect(failUrl);
    }
  } catch (error) {
    console.error('Callback error:', error);
    const errorUrl = `${process.env.FRONTEND_URL}/order-error?message=${encodeURIComponent(error.message)}`;
    res.redirect(errorUrl);
  }
};

exports.paymobWebhook = async function(req, res, next) {
  try {
    // Log webhook for debugging
    // console.log('Paymob Webhook received:', JSON.stringify(req.body, null, 2));
    
    // Process webhook (no HMAC in webhook)
    await orderServices.processPaymobWebhook(req.body);
    
    // Respond immediately to Paymob (they expect quick 200 response)
    res.status(200).json({
      status: "success",
      message: "Webhook processed"
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent Paymob from retrying
    res.status(200).json({
      status: "success",
      message: "Received"
    });
  }
};

exports.retryPayment = async function(req, res, next) {
  try {
    const { paymentMethod = 'card', phoneNumber } = req.body;
    
    const result = await orderServices.retryOrderPayment(
      req.params.id,
      req.user._id,
      paymentMethod,
      phoneNumber
    );
    
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