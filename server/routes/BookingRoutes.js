const express = require("express");
const router = express.Router();
 // Import your auth middleware
const {
  createBooking,
  getAllBookings,  // Changed from getAllBookings to getUserBookings
  updateBookingStatus,
  cancelBooking,
  getBookingById,
  notifyOwnerOnConfirmation,
} = require("../controllers/BookingController");

// Apply authentication middleware to all booking routes


// Create a new booking (requires authentication)
router.post("/", createBooking);

// Get bookings for the authenticated user only
router.get("/", getAllBookings); // Changed to getUserBookings

// Update booking status (requires authentication)
router.patch("/:id", updateBookingStatus);

// Cancel booking (requires authentication)
router.delete("/cancel/:id", cancelBooking);

// Get specific booking (requires authentication and ownership check)
router.get("/:id", getBookingById);

// Notify owner (requires authentication)
router.post("/owner-confirmation", notifyOwnerOnConfirmation);

module.exports = router;
