const express = require("express");
const {
  createBookingHandler,
  getAllBookingsHandler,
  getBookingByIdHandler,
  cancelBookingHandler,
  updateBookingStatusHandler
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/bookings", createBookingHandler);
router.get("/bookings", getAllBookingsHandler);
router.get("/bookings/:bookingId", getBookingByIdHandler);
router.patch("/bookings/:bookingId/status", updateBookingStatusHandler);
router.delete("/bookings/:bookingId", cancelBookingHandler);

module.exports = router;
