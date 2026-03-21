const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking,
} = require("../controllers/bookingController");

// POST   /bookings         — create a booking
router.post("/", createBooking);

// GET    /bookings         — list all bookings (supports ?userId=)
router.get("/", getAllBookings);

// GET    /bookings/:id     — single booking
router.get("/:id", getBookingById);

// DELETE /bookings/:id     — cancel a booking
router.delete("/:id", cancelBooking);

module.exports = router;
