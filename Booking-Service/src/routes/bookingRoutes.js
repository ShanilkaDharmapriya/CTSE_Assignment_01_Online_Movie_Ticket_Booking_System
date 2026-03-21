const express = require("express");
const {
  createBookingHandler,
  getAllBookingsHandler,
  getBookingByIdHandler,
  cancelBookingByIdHandler
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/bookings", createBookingHandler);
router.get("/bookings", getAllBookingsHandler);
router.get("/bookings/:bookingId", getBookingByIdHandler);
router.delete("/bookings/:bookingId", cancelBookingByIdHandler);

module.exports = router;
