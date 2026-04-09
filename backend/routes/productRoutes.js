const express = require("express");
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductsByCategory,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts
} = require("../controller/productController.js");
const { verifyToken, requireAdmin } = require("../middleware/auth.js");
const upload = require("../middleware/upload.js");

// 👤 Public routes
router.get("/", getAllProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/search", searchProducts);   // ✅ before /:id
router.get("/:id", getProductById);

// 👑 Admin only
router.post("/", verifyToken, requireAdmin, upload.single("image"), createProduct);
router.put("/:id", verifyToken, requireAdmin, upload.single("image"), updateProduct);
router.delete("/:id", verifyToken, requireAdmin, deleteProduct);

module.exports = router;