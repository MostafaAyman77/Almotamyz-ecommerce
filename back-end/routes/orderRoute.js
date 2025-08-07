const express = require("express");

const {
  createCashOrder,
  filterOrderForLoggedUser,
  findAllOrders,
  findSpecificOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  checkoutSession,
  cancelOrder,
} = require("../services/orderService");

const authService = require("../services/authService");

const {
  createCashOrderValidator,
  getOrderValidator,
  updateOrderStatusValidator,
  checkoutSessionValidator,
} = require("../utils/validators/orderValidator");

const router = express.Router();

// Guest checkout routes (no authentication required)
// Use a more specific path to avoid conflicts with :id parameter
router.post(
  "/create-from-cart/:cartId",
  createCashOrderValidator,
  createCashOrder
);

// Authenticated user routes
router.use(authService.protect);

router.get(
  "/checkout-session/:cartId",
  authService.allowedTo("user"),
  checkoutSessionValidator,
  checkoutSession
);

router.get("/", filterOrderForLoggedUser, findAllOrders);

// Admin/Manager routes - these must come before the generic :id route
router.put(
  "/:id/pay",
  authService.allowedTo("admin", "manager"),
  getOrderValidator,
  updateOrderToPaid
);

router.put(
  "/:id/deliver",
  authService.allowedTo("admin", "manager"),
  getOrderValidator,
  updateOrderToDelivered
);

router.put(
  "/:id/status",
  authService.allowedTo("admin", "manager"),
  updateOrderStatusValidator,
  updateOrderStatus
);

router.put("/:id/cancel", getOrderValidator, cancelOrder);

// Get specific order - must be last to avoid conflicts
router.get("/:id", getOrderValidator, findSpecificOrder);

module.exports = router;
