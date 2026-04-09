const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    // ✅ Optional - logged in user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },

    // ✅ Guest info - when no login
    guestInfo: {
        name: { type: String, required: false },
        email: { type: String, required: false },
        phone: { type: String, required: false }
    },

    // ✅ Order items
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            name: { type: String, required: true },
            image: { type: String, required: false },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            size: { type: String, required: false },
            flavour: { type: String, required: false }
        }
    ],

    // ✅ Delivery address
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: false },
        zipCode: { type: String, required: false },
        country: { type: String, required: true }
    },

    // ✅ Payment
    paymentMethod: {
        type: String,
        enum: ["Cash on Delivery", "Card", "Online"],
        default: "Cash on Delivery"
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: {
        type: Date,
        required: false
    },

    // ✅ Pricing
    totalPrice: {
        type: Number,
        required: true
    },
    shippingPrice: {
        type: Number,
        default: 0
    },

    // ✅ Order status
    status: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    },
    deliveredAt: {
        type: Date,
        required: false
    }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);