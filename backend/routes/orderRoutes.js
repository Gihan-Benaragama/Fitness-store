const express = require("express");
const router = express.Router();
const { verifyToken, optionalAuth } = require("../middleware/auth.js");
const {
    createOrder,
    getAllOrders,
    getOrderById,
    getOrdersByUser,
    updateOrderStatus,
    cancelOrder
} = require("../controller/orderController");

// 👤 Authenticated routes
router.get("/user/:userId", verifyToken, getOrdersByUser);

// 👤 Public routes (allow both authenticated and guest)
router.post("/", optionalAuth, createOrder);
router.get("/:id", getOrderById);

// 👑 Admin only
router.get("/", getAllOrders);
router.put("/:id/status", updateOrderStatus);
router.put("/:id/cancel", cancelOrder);

module.exports = router;