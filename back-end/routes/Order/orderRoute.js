const express = require("express");

const {
    createCashOrder,
    createCardPayment,
    createWalletPayment,
    paymobCallback,
    getAllOrders,
    getOrder,
    updateOrderToPaid,
    updateOrderToDelivered,
    cancelOrder,
    deleteOrder,
} = require("./../../services/Order/orderServices");

const authService = require("./../../services/authService");

const {
    createOrderValidator,
    createWalletPaymentValidator,
    getOrderValidator,
    updateOrderValidator,
} = require("./../../utils/validators/order/orderValidator");

const router = express.Router();

// Public route for Paymob callback
router.post("/paymob-callback", paymobCallback);

// Protected routes - require authentication
router.use(authService.protect);

// User routes
router.post(
    "/:cartId",
    authService.allowedTo("user"),
    createCashOrder
);

router.post(
    "/:cartId/pay-card",
    authService.allowedTo("user"),
    createCardPayment
);

router.post(
    "/:cartId/pay-wallet",
    authService.allowedTo("user"),
    createWalletPayment
);

router.get(
    "/",
    authService.allowedTo("user", "admin", "manager"),
    getAllOrders
);

router.get(
    "/:id",
    authService.allowedTo("user", "admin", "manager"),
    getOrder
);

router.put(
    "/:id/cancel",
    authService.allowedTo("user", "admin", "manager"),
    cancelOrder
);

// Admin/Manager only routes
router.put(
    "/:id/pay",
    authService.allowedTo("admin", "manager"),
    updateOrderToPaid
);

router.put(
    "/:id/deliver",
    authService.allowedTo("admin", "manager"),
    updateOrderToDelivered
);

router.delete(
    "/:id",
    authService.allowedTo("admin"),
    deleteOrder
);

module.exports = router;