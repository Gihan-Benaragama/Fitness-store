require("dotenv").config();

// ✅ Fix Windows DNS SRV lookup failure — force Node to use Google public DNS (8.8.8.8)
// Windows local router DNS often doesn't support SRV record queries used by mongodb+srv://
const dns = require("dns");
const productRoutes = require("./routes/productRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");


dns.setServers(["8.8.8.8", "8.8.4.4"]);         // Google public DNS — supports SRV records
dns.setDefaultResultOrder("ipv4first");            // Prefer IPv4 addresses

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const cartRoutes = require("./routes/cartRoutes.js");


const userRoutes = require("./routes/userRoutes.js");

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://fitness-store-theta.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            family: 4,              // Force IPv4
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 30000,
            retryWrites: true,
            retryReads: true,
            tls: true,
        });
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ Error connecting to MongoDB:", err.message);
        console.error("Error code:", err.code);
        console.log("\nTroubleshooting tips:");
        console.log("1. Check if your IP is whitelisted in MongoDB Atlas (Network Access → 0.0.0.0/0 for all IPs)");
        console.log("2. Verify your Atlas username/password in .env");
        console.log("3. Make sure the cluster name in the URI is correct");
        // Retry after 5 seconds
        console.log("\n🔄 Retrying connection in 5 seconds...");
        setTimeout(connectDB, 5000);
    }
};

connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
module.exports = app; // ← ADD THIS LINE


/*{
  "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "$2b$10$hashedPasswordValueHere",
  "phone": "+1234567890",
  "address": "123 Main Street, New York, NY 10001",
  "isAdmin": true,
  "isBlocked": false,
  "createdAt": "2024-01-13T10:30:00.000Z",
  "updatedAt": "2024-01-13T10:30:00.000Z",
  "__v": 0
}*/


/*{
    "firstName": "Netha",
    "lastName": "User",
    "email": "netha@gmail.com",
    "password": "1234",
    "phone": "0771234567",
    "address": "123 Main Street, Colombo",
    "isAdmin": false
}*/