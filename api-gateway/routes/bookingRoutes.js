const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const {
  createBooking,
  updateBookingStatus,
  getAllBookings,
  getBookingById,
  cancelBooking,
} = require("../controllers/bookingController");

// POST   /bookings         — create a booking
router.post("/", requireAuth, createBooking);

// GET    /bookings         — list all bookings (supports ?userId=)
router.get("/", requireAuth, getAllBookings);

// PATCH  /bookings/:id/status — update payment/booking state
router.patch("/:id/status", requireAuth, updateBookingStatus);

// GET    /bookings/:id     — single booking
router.get("/:id", requireAuth, getBookingById);

// DELETE /bookings/:id     — cancel a booking
router.delete("/:id", requireAuth, cancelBooking);

module.exports = router;
