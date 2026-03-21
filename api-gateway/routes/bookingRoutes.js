const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking,
} = require("../controllers/bookingController");

// POST   /bookings         — create a booking (auth required)
router.post("/", requireAuth, createBooking);

// GET    /bookings         — list all bookings (auth required)
router.get("/", requireAuth, getAllBookings);

// GET    /bookings/:id     — single booking (auth required)
router.get("/:id", requireAuth, getBookingById);

// DELETE /bookings/:id     — cancel a booking (auth required)
router.delete("/:id", requireAuth, cancelBooking);

module.exports = router;
