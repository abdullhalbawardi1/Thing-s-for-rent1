const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    renter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    owner: { // Store owner ID for easier querying/validation
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed"], // Example statuses
        default: "pending"
    },
    // Add other fields like payment details, special requests, etc.
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Optional: Add validation to ensure endDate is after startDate
bookingSchema.pre("save", function(next) {
    if (this.endDate <= this.startDate) {
        next(new Error("End date must be after start date"));
    } else {
        next();
    }
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
