const express = require("express");
const router = express.Router();
const { createOrder, getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus, updatePaymentStatus, deleteOrder, getOrderStats, createOrderWithPayment, paymobCallback, paymobWebhook, retryPayment } = require("./OrderController.js");
const { protect, allowedTo } = require("../../services/authService.js");
const { userRole } = require("../../enum.js");
const { createOrderValidation, orderQueryValidation, orderIdValidation, updateOrderStatusValidation, } = require("../../utils/validators/order/orderValidator.js");

router.post("/paymob/callback", paymobWebhook);
router.get("/paymob/webhook", paymobCallback);
// All routes are protected
router.use(protect);

// User routes
// router.use(allowedTo(userRole.user));
router.post("/", allowedTo(userRole.user), createOrderValidation, createOrder);
router.get("/my-orders", allowedTo(userRole.user), orderQueryValidation, getMyOrders);
router.get("/:id", allowedTo(userRole.user), orderIdValidation, getOrder);
router.patch("/:id/cancel", allowedTo(userRole.user), orderIdValidation, cancelOrder);

// Add these routes in the User routes section (after existing user routes):
router.post("/checkout", allowedTo(userRole.user), createOrderValidation, createOrderWithPayment);
router.post("/:id/retry-payment", allowedTo(userRole.user), orderIdValidation, retryPayment);


// Admin routes
router.get("/", allowedTo(userRole.admin), orderQueryValidation, getAllOrders);
router.patch("/:id/status", allowedTo(userRole.admin), updateOrderStatusValidation, updateOrderStatus);
router.patch("/:id/payment-status", allowedTo(userRole.admin), updatePaymentStatus);
router.delete("/:id", allowedTo(userRole.admin), orderIdValidation, deleteOrder);
router.get("/stats/overview", allowedTo(userRole.admin), getOrderStats);



module.exports = router;