const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    blockUser
} = require("../controller/userController.js");

// 👤 Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// 👑 Admin & User routes
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/block/:id", blockUser);  // ✅ Must be before /:id to avoid route conflict
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;