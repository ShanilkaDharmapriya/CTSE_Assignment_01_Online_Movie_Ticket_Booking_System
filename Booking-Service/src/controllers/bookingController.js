const {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking
} = require("../services/bookingService");

async function createBookingHandler(req, res, next) {
  try {
    const userId = req.auth?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }
    // Always use the authenticated user — never trust userId from the request body.
    const createdBooking = await createBooking(req.body, userId, req.headers.authorization);
    return res.status(201).json(createdBooking);
  } catch (error) {
    return next(error);
  }
}

async function getAllBookingsHandler(req, res, next) {
  try {
    // Return bookings for the authenticated user only (privacy-protected)
    const userId = req.auth?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }
    const bookings = await getBookings(userId);
    return res.status(200).json(bookings);
  } catch (error) {
    return next(error);
  }
}

async function getBookingByIdHandler(req, res, next) {
  try {
    // Find one booking from MongoDB with user ownership verification
    const userId = req.auth?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }
    const bookingRecord = await getBookingById(req.params.bookingId, userId);
    return res.status(200).json(bookingRecord);
  } catch (error) {
    return next(error);
  }
}

async function cancelBookingHandler(req, res, next) {
  try {
    // Cancel a booking with user verification and refund processing
    const userId = req.auth?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }
    const cancellationReason = req.body?.reason || "User requested";
    const cancelledBooking = await cancelBooking(
      req.params.bookingId,
      userId,
      cancellationReason,
      req.headers.authorization
    );
    return res.status(200).json(cancelledBooking);
  } catch (error) {
    // Pass errors to centralized error handler middleware.
    return next(error);
  }
}

module.exports = {
  createBookingHandler,
  getAllBookingsHandler,
  getBookingByIdHandler,
  cancelBookingHandler
};
