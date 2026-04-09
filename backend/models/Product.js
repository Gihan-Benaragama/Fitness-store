const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    category: {
        type: String,
        enum: ["Supplements", "Clothing", "Accessories", "Shaker Bottles"],
        required: true
    },
    subCategory: {
        type: String,
        enum: ["Protein", "Vitamins", "Pre-workout", "T-Shirt", "Shorts", "Shoes", "Bag", "Lifting Accessories", "Shaker Bottles", "Other"],
        required: false
    },
    price: {
        type: Number,
        required: true
    },
    discountPrice: {
        type: Number,
        required: false
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    images: {
        type: [String],
        default: []
    },
    brand: {
        type: String,
        required: false
    },
    ratings: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    // For clothing only
    sizes: {
        type: [String],
        enum: ["XS", "S", "M", "L", "XL", "XXL"],
        default: []
    },
    // For supplements only
    weight: {
        type: String,
        required: false  // e.g. "1kg", "2.5kg"
    },
    flavour: {
        type: [String],
        default: []  // e.g. ["Chocolate", "Vanilla"]
    }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);