const express = require("express");
const {
    createProductRating,
    getProductRatings,
} = require("../controllers/ratingController");
const { protect } = require("../middleware/authMiddleware");

// This router will be mounted under /api/products/:productId/ratings
// We use mergeParams: true to access :productId from the parent router (product router)
const router = express.Router({ mergeParams: true });

// GET /api/products/:productId/ratings - Get all ratings for a product (Public)
router.route("/").get(getProductRatings);

// POST /api/products/:productId/ratings - Create a new rating (Private)
router.route("/").post(protect, createProductRating);

module.exports = router;
