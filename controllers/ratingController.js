const asyncHandler = require("express-async-handler");
const Rating = require("../models/Rating");
const Product = require("../models/Product");
const Booking = require("../models/Booking"); // Needed to check if user booked the product

// @desc    Create a new rating for a product
// @route   POST /api/products/:productId/ratings
// @access  Private
const createProductRating = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const productId = req.params.productId;
    const userId = req.user._id;

    if (!rating) {
        res.status(400);
        throw new Error("Rating value is required");
    }

    const product = await Product.findById(productId);

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // Prevent owner from rating their own product
    if (product.owner.toString() === userId.toString()) {
        res.status(400);
        throw new Error("You cannot rate your own product");
    }

    // Check if the user has already rated this product
    const alreadyRated = await Rating.findOne({ product: productId, user: userId });

    if (alreadyRated) {
        res.status(400);
        throw new Error("You have already rated this product");
    }

    // Optional: Check if the user has actually booked/completed a booking for this product
    // const completedBooking = await Booking.findOne({
    //     product: productId,
    //     renter: userId,
    //     status: "completed",
    // });
    // if (!completedBooking) {
    //     res.status(403); // Forbidden
    //     throw new Error("You must complete a booking for this product to rate it");
    // }

    const newRating = new Rating({
        product: productId,
        user: userId,
        rating,
        comment,
    });

    await newRating.save();

    // Optional: Update the product's average rating (can be complex, might do later or via a separate process)

    res.status(201).json({ message: "Rating added successfully" });
});

// @desc    Get all ratings for a product
// @route   GET /api/products/:productId/ratings
// @access  Public
const getProductRatings = asyncHandler(async (req, res) => {
    const productId = req.params.productId;

    const productExists = await Product.findById(productId);
    if (!productExists) {
        res.status(404);
        throw new Error("Product not found");
    }

    const ratings = await Rating.find({ product: productId })
                              .populate("user", "name profilePicture") // Populate user details
                              .sort({ createdAt: -1 }); // Sort by newest first

    res.json(ratings);
});

module.exports = {
    createProductRating,
    getProductRatings,
};
