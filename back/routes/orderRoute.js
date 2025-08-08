const express = require('express');

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
} = require('../services/orderService');

const authService = require('../services/authService');

const {
    createCashOrderValidator,
    getOrderValidator,
    updateOrderStatusValidator,
    checkoutSessionValidator,
} = require('../utils/validators/orderValidator');

const router = express.Router();

// Guest checkout routes (no authentication required)
router.route('/:cartId').post(
    createCashOrderValidator,
    createCashOrder
);

// Authenticated user routes
router.use(authService.protect);

router.get(
    '/checkout-session/:cartId',
    authService.allowedTo('user'),
    checkoutSessionValidator,
    checkoutSession
);

router.get(
    '/',
    filterOrderForLoggedUser,
    findAllOrders
);

router.get('/:id', getOrderValidator, findSpecificOrder);

// Admin/Manager routes
router.put(
    '/:id/pay',
    authService.allowedTo('admin', 'manager'),
    getOrderValidator,
    updateOrderToPaid
);

router.put(
    '/:id/deliver',
    authService.allowedTo('admin', 'manager'),
    getOrderValidator,
    updateOrderToDelivered
);

router.put(
    '/:id/status',
    authService.allowedTo('admin', 'manager'),
    updateOrderStatusValidator,
    updateOrderStatus
);

// Cancel order - users can cancel their own orders, admins can cancel any
router.put('/:id/cancel', getOrderValidator, cancelOrder);

module.exports = router;

