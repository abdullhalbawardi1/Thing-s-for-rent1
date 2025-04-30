const asyncHandler = require("express-async-handler");
const Booking = require("../models/Booking");
const Product = require("../models/Product");

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
    const { product: productId, startDate, endDate } = req.body;
    const renterId = req.user._id; // Get renter from authenticated user

    // Basic validation
    if (!productId || !startDate || !endDate) {
        res.status(400);
        throw new Error("Please provide product ID, start date, and end date");
    }

    const product = await Product.findById(productId);

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    if (!product.isAvailable) {
        res.status(400);
        throw new Error("Product is currently not available for booking");
    }

    // Check if renter is the owner
    if (product.owner.toString() === renterId.toString()) {
        res.status(400);
        throw new Error("You cannot book your own product");
    }

    // Check for booking conflicts (basic check, can be more sophisticated)
    const existingBooking = await Booking.findOne({
        product: productId,
        status: { $in: ["pending", "confirmed"] }, // Check pending and confirmed bookings
        $or: [
            { startDate: { $lt: endDate }, endDate: { $gt: startDate } }, // Overlaps
        ],
    });

    if (existingBooking) {
        res.status(400);
        throw new Error("Product is already booked for the selected dates");
    }

    // Calculate total price (basic example: price per day)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (durationDays <= 0) {
         res.status(400);
        throw new Error("End date must be after start date");
    }
    const totalPrice = durationDays * product.price;

    const booking = new Booking({
        product: productId,
        renter: renterId,
        owner: product.owner,
        startDate,
        endDate,
        totalPrice,
        status: "pending", // Default status
    });

    const createdBooking = await booking.save();

    // Optionally, update product availability if needed, or handle via status

    res.status(201).json(createdBooking);
});

// @desc    Get bookings for the logged-in user (as renter)
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ renter: req.user._id })
        .populate("product", "name images price") // Populate product details
        .populate("owner", "name email"); // Populate owner details
    res.json(bookings);
});

// @desc    Get bookings for a specific product (for owner)
// @route   GET /api/bookings/product/:productId
// @access  Private
const getProductBookings = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.productId);

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // Check if logged-in user owns the product
    if (product.owner.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("Not authorized to view bookings for this product");
    }

    const bookings = await Booking.find({ product: req.params.productId })
        .populate("renter", "name email"); // Populate renter details

    res.json(bookings);
});

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private (Renter or Owner)
const getBookingById = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate("product", "name description images price")
        .populate("renter", "name email phoneNumber")
        .populate("owner", "name email phoneNumber");

    if (!booking) {
        res.status(404);
        throw new Error("Booking not found");
    }

    // Check if the logged-in user is the renter or the owner
    if (booking.renter._id.toString() !== req.user._id.toString() &&
        booking.owner._id.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("Not authorized to view this booking");
    }

    res.json(booking);
});


// @desc    Update booking status (e.g., confirm, cancel)
// @route   PUT /api/bookings/:id/status
// @access  Private (Primarily Owner, potentially Renter for cancellation)
const updateBookingStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const allowedStatuses = ["pending", "confirmed", "cancelled", "completed"];

    if (!status || !allowedStatuses.includes(status)) {
        res.status(400);
        throw new Error(`Invalid status. Allowed statuses are: ${allowedStatuses.join(", ")}`);
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error("Booking not found");
    }

    // Authorization logic: Who can change status to what?
    // Example: Owner can confirm/cancel pending bookings.
    // Example: Renter can cancel their own pending/confirmed bookings (if allowed).
    const isOwner = booking.owner.toString() === req.user._id.toString();
    const isRenter = booking.renter.toString() === req.user._id.toString();

    // Basic authorization - refine as needed
    if (!isOwner && !(isRenter && status === "cancelled")) { // Allow renter only to cancel
         res.status(401);
         throw new Error("Not authorized to update booking status");
    }

    // Add more specific logic based on current status and target status if needed
    // e.g., cannot confirm an already cancelled booking

    booking.status = status;
    const updatedBooking = await booking.save();

    // Optionally: Update product availability based on status change
    // if (status === 'cancelled' || status === 'completed') { ... update product ... }

    res.json(updatedBooking);
});


module.exports = {
    createBooking,
    getMyBookings,
    getProductBookings,
    getBookingById,
    updateBookingStatus,
};
