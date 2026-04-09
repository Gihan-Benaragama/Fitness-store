const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");

// ✅ Create review
exports.createReview = async (req, res) => {
    try {
        // Check if product exists
        const product = await Product.findById(req.body.productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if user already reviewed this product
        const existing = await Review.findOne({
            user: req.body.userId,
            product: req.body.productId
        });
        if (existing) {
            return res.status(400).json({ message: "You already reviewed this product" });
        }

        // Check if user actually bought this product
        const order = await Order.findOne({
            user: req.body.userId,
            "items.product": req.body.productId,
            status: "Delivered"
        });

        const newReview = new Review({
            user: req.body.userId,
            product: req.body.productId,
            rating: req.body.rating,
            comment: req.body.comment,
            isVerifiedPurchase: order ? true : false
        });

        await newReview.save();

        // Update product ratings
        const allReviews = await Review.find({ product: req.body.productId });
        const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

        await Product.findByIdAndUpdate(req.body.productId, {
            ratings: avgRating.toFixed(1),
            numReviews: allReviews.length
        });

        res.status(201).json({
            message: "Review added successfully",
            review: newReview
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get all reviews for a product
exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate("user", "firstName lastName");

        if (reviews.length === 0) {
            return res.status(404).json({ message: "No reviews found" });
        }

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get all reviews by user
exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.params.userId })
            .populate("product", "name images");

        if (reviews.length === 0) {
            return res.status(404).json({ message: "No reviews found" });
        }

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Update review
exports.updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        review.rating = req.body.rating || review.rating;
        review.comment = req.body.comment || review.comment;

        await review.save();

        // Update product ratings
        const allReviews = await Review.find({ product: review.product });
        const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

        await Product.findByIdAndUpdate(review.product, {
            ratings: avgRating.toFixed(1),
            numReviews: allReviews.length
        });

        res.status(200).json({
            message: "Review updated successfully",
            review: review
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Delete review
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Update product ratings after delete
        const allReviews = await Review.find({ product: review.product });

        if (allReviews.length > 0) {
            const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
            await Product.findByIdAndUpdate(review.product, {
                ratings: avgRating.toFixed(1),
                numReviews: allReviews.length
            });
        } else {
            await Product.findByIdAndUpdate(review.product, {
                ratings: 0,
                numReviews: 0
            });
        }

        res.status(200).json({ message: "Review deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};