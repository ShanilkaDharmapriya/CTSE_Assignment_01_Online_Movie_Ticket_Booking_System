const express = require("express");
const {
  createBookingHandler,
  getAllBookingsHandler,
  getBookingByIdHandler
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/bookings", createBookingHandler);
router.get("/bookings", getAllBookingsHandler);
router.get("/bookings/:bookingId", getBookingByIdHandler);

module.exports = router;
