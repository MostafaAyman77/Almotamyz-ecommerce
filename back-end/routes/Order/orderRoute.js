const express = require("express");
const router = express.Router();
const { createOrder, getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus, updatePaymentStatus, deleteOrder, getOrderStats } = require("../../services/Order/orderServices.js");
const { protect, allowedTo } = require("../../services/authService.js");
const { userRole } = require("../../enum.js");

// All routes are protected
router.use(protect);

// User routes
router.use(allowedTo(userRole.user));
router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrder);
router.patch("/:id/cancel", cancelOrder);

// Admin routes
router.use(allowedTo(userRole.admin));
router.get("/", getAllOrders);
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id/payment-status", updatePaymentStatus);
router.delete("/:id", deleteOrder);
router.get("/stats/overview", getOrderStats);



module.exports = router;