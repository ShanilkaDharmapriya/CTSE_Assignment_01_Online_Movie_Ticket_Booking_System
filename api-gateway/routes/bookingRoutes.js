const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const { getAllBookings, getBookingById, cancelBooking } = require("../controllers/bookingController");

// GET    /bookings         — list all bookings (supports ?userId= for admin)
router.get("/", requireAuth, getAllBookings);

// GET    /bookings/:id     — single booking
router.get("/:id", requireAuth, getBookingById);

// DELETE /bookings/:id     — cancel a booking
router.delete("/:id", requireAuth, cancelBooking);

module.exports = router;
