const {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  updateBookingStatus
} = require("../services/bookingService");

async function createBookingHandler(req, res, next) {
  try {
    // Create a booking using validated business flow from service layer.
    const createdBooking = await createBooking(req.body);
    return res.status(201).json(createdBooking);
  } catch (error) {
    // Pass errors to centralized error handler middleware.
    return next(error);
  }
}

function getAllBookingsHandler(req, res) {
  // Return every booking currently saved in the store.
  return res.status(200).json(getBookings(req.query?.userId));
}

function getBookingByIdHandler(req, res) {
  // Find one booking using the id from URL path.
  const bookingRecord = getBooking(req.params.bookingId);
  if (!bookingRecord) {
    return res.status(404).json({ message: "Booking not found" });
  }
  return res.status(200).json(bookingRecord);
}

async function cancelBookingHandler(req, res, next) {
  try {
    const cancelledBooking = await cancelBooking(req.params.bookingId);
    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking: cancelledBooking,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateBookingStatusHandler(req, res, next) {
  try {
    const updatedBooking = await updateBookingStatus(req.params.bookingId, req.body);
    return res.status(200).json(updatedBooking);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createBookingHandler,
  getAllBookingsHandler,
  getBookingByIdHandler,
  cancelBookingHandler,
  updateBookingStatusHandler
};
