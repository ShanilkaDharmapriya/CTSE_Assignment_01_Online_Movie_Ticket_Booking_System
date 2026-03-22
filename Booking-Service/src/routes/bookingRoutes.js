const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireServiceKey } = require("../middleware/serviceAuthMiddleware");
const {
  createBookingHandler,
  getAllBookingsHandler,
  getBookingByIdHandler,
  cancelBookingHandler,
  updateBookingStatusHandler,
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/bookings", requireServiceKey, createBookingHandler);
router.patch("/bookings/:bookingId/status", requireServiceKey, updateBookingStatusHandler);

router.get("/bookings", requireAuth, getAllBookingsHandler);
router.get("/bookings/:bookingId", requireAuth, getBookingByIdHandler);
router.delete("/bookings/:bookingId", requireAuth, cancelBookingHandler);

module.exports = router;
