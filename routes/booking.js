const express = require("express");
const {
    createBooking,
    getMyBookings,
    getProductBookings,
    getBookingById,
    updateBookingStatus,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All booking routes require authentication
router.use(protect);

router.route("/").post(createBooking);
router.route("/mybookings").get(getMyBookings);
router.route("/product/:productId").get(getProductBookings); // Get bookings for a specific product (owner view)
router.route("/:id").get(getBookingById);
router.route("/:id/status").put(updateBookingStatus); // Update booking status (confirm/cancel)

module.exports = router;
