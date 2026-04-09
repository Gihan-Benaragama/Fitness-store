const express = require("express");
const router = express.Router();
const { optionalAuth } = require("../middleware/auth.js");
const {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require("../controller/cartController.js");

router.post("/", optionalAuth, addToCart);                                    // Add to cart
router.get("/", optionalAuth, getCart);                                      // Get cart
router.put("/:productId", optionalAuth, updateCartItem);                     // Update quantity
router.delete("/:productId", optionalAuth, removeFromCart);                  // Remove item
router.delete("/", optionalAuth, clearCart);                                 // Clear cart

module.exports = router;