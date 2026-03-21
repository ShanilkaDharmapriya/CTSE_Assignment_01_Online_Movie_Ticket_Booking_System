const {
  createBooking,
  getBookings,
  getBookingById
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

async function getAllBookingsHandler(req, res, next) {
  try {
    // Return every booking currently saved in MongoDB.
    const bookings = await getBookings();
    return res.status(200).json(bookings);
  } catch (error) {
    return next(error);
  }
}

async function getBookingByIdHandler(req, res, next) {
  try {
    // Find one booking from MongoDB using the id from URL path.
    const bookingRecord = await getBookingById(req.params.bookingId);
    if (!bookingRecord) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.status(200).json(bookingRecord);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createBookingHandler,
  getAllBookingsHandler,
  getBookingByIdHandler
};
