const {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  updateBookingStatus,
} = require("../services/bookingService");

async function createBookingHandler(req, res, next) {
  try {
    const createdBooking = await createBooking(req.body);
    return res.status(201).json(createdBooking);
  } catch (error) {
    return next(error);
  }
}

function getAllBookingsHandler(req, res) {
  const role = String(req.auth?.user?.role || "").toLowerCase();
  const uid = req.auth?.user?.id;

  let filterUserId = uid;
  if (role === "admin") {
    const q = req.query?.userId;
    filterUserId = q !== undefined && q !== "" ? q : undefined;
  }

  return res.status(200).json(getBookings(filterUserId));
}

function getBookingByIdHandler(req, res) {
  const bookingRecord = getBooking(req.params.bookingId);
  if (!bookingRecord) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const role = String(req.auth?.user?.role || "").toLowerCase();
  const uid = req.auth?.user?.id;
  if (role !== "admin" && String(bookingRecord.userId) !== String(uid)) {
    return res.status(403).json({ message: "Forbidden: you can only access your own bookings" });
  }

  return res.status(200).json(bookingRecord);
}

async function cancelBookingHandler(req, res, next) {
  try {
    const bookingRecord = getBooking(req.params.bookingId);
    if (!bookingRecord) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const role = String(req.auth?.user?.role || "").toLowerCase();
    const uid = req.auth?.user?.id;
    if (role !== "admin" && String(bookingRecord.userId) !== String(uid)) {
      return res.status(403).json({ message: "Forbidden" });
    }

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
  updateBookingStatusHandler,
};
