const {
  createBooking,
  listBookingsForPrincipal,
  getBookingByBookingId,
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

async function getAllBookingsHandler(req, res, next) {
  try {
    const role = req.auth?.user?.role;
    const jwtUserId = req.auth?.user?.id;
    if (!jwtUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isAdmin = String(role || "").toLowerCase() === "admin";
    const queryUserId = isAdmin ? req.query?.userId : undefined;

    const rows = await listBookingsForPrincipal({
      role,
      jwtUserId,
      queryUserId,
    });

    const shaped = rows.map((b) => ({
      ...b,
      bookingReference: b.bookingId,
    }));

    return res.status(200).json(shaped);
  } catch (error) {
    return next(error);
  }
}

async function getBookingByIdHandler(req, res, next) {
  try {
    const bookingRecord = await getBookingByBookingId(req.params.bookingId);
    if (!bookingRecord) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const role = String(req.auth?.user?.role || "").toLowerCase();
    const uid = req.auth?.user?.id;
    if (role !== "admin" && String(bookingRecord.userId) !== String(uid)) {
      return res.status(403).json({ message: "Forbidden: you can only access your own bookings" });
    }

    return res.status(200).json({
      ...bookingRecord,
      bookingReference: bookingRecord.bookingId,
    });
  } catch (error) {
    return next(error);
  }
}

async function cancelBookingHandler(req, res, next) {
  try {
    const bookingRecord = await getBookingByBookingId(req.params.bookingId);
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
      booking: { ...cancelledBooking, bookingReference: cancelledBooking.bookingId },
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
