const express = require("express");
const { requireAuth } = require("../../middleware/authMiddleware");
const {
  createBookingHandler,
  getAllBookingsHandler,
  getBookingByIdHandler,
  cancelBookingHandler
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/bookings", createBookingHandler);
router.get("/bookings", requireAuth, getAllBookingsHandler);
router.get("/bookings/:bookingId", requireAuth, getBookingByIdHandler);
router.delete("/bookings/:bookingId", requireAuth, cancelBookingHandler);

module.exports = router;

