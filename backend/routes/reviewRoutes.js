const express = require("express");
const router = express.Router();
const {
    createReview,
    getProductReviews,
    getUserReviews,
    updateReview,
    deleteReview
} = require("../controller/reviewController");

router.post("/", createReview);
router.get("/product/:productId", getProductReviews);
router.get("/user/:userId", getUserReviews);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

module.exports = router;