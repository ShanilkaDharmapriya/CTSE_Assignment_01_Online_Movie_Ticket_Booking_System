const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking,
} = require("../controllers/bookingController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

// POST   /bookings         — create a booking
router.post("/", requireAuth, requireRole("CUSTOMER"), createBooking);

// GET    /bookings         — list all bookings (supports ?userId=)
router.get("/", requireAuth, getAllBookings);

// GET    /bookings/:id     — single booking
router.get("/:id", requireAuth, getBookingById);

// DELETE /bookings/:id     — cancel a booking
router.delete("/:id", requireAuth, cancelBooking);

module.exports = router;
