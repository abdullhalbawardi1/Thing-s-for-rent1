const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    user: { // The user who gave the rating
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1, // Example: 1-5 star rating
        max: 5
    },
    comment: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Optional: Add index for faster querying by product or user
ratingSchema.index({ product: 1 });
ratingSchema.index({ user: 1 });

const Rating = mongoose.model("Rating", ratingSchema);

module.exports = Rating;
