const { v4: uuidv4 } = require("uuid");
const {
  addBooking,
  getAllBookings,
  getBookingById,
  updateBookingById,
} = require("../models/bookingStore");
const { getMovieById, getShowById } = require("./externalServices");

function normalizeSeatList(seats) {
  if (!Array.isArray(seats)) return [];
  return [...new Set(seats.map((s) => String(s).trim().toUpperCase()).filter(Boolean))];
}

function validateConfirmedBookingPayload(payload) {
  const { userId, movieId, showId, seats, bookingId, status, paymentId } = payload || {};

  const seatList = normalizeSeatList(seats);
  if (!userId || !movieId || !showId || seatList.length === 0) {
    const validationError = new Error(
      "Invalid input: userId, movieId, showId, non-empty seats array, and paymentId are required"
    );
    validationError.statusCode = 400;
    throw validationError;
  }

  if (!paymentId) {
    const err = new Error("paymentId is required for confirmed bookings");
    err.statusCode = 400;
    throw err;
  }

  const normalizedStatus = String(status || "").toUpperCase();
  if (normalizedStatus !== "CONFIRMED") {
    const err = new Error("Bookings can only be created as CONFIRMED after successful payment");
    err.statusCode = 400;
    throw err;
  }

  return {
    userId: String(userId),
    movieId: String(movieId),
    showId: String(showId),
    seats: seatList,
    bookingId: bookingId ? String(bookingId) : null,
    status: normalizedStatus,
    paymentId: String(paymentId),
  };
}

async function createBooking(payload) {
  const {
    userId,
    movieId,
    showId,
    seats,
    bookingId: incomingBookingId,
    status,
    paymentId,
  } = validateConfirmedBookingPayload(payload);

  try {
    await getMovieById(movieId);
  } catch {
    const movieError = new Error("Movie not found");
    movieError.statusCode = 400;
    throw movieError;
  }

  try {
    await getShowById(showId);
  } catch {
    const showError = new Error("Show not found");
    showError.statusCode = 400;
    throw showError;
  }

  const bookingId = incomingBookingId || uuidv4();

  const createdBooking = addBooking({
    bookingId,
    bookingReference: bookingId,
    userId,
    movieId,
    showId,
    seats,
    status,
    paymentStatus: payload?.paymentStatus ? String(payload.paymentStatus).toUpperCase() : "SUCCESS",
    paymentId,
    amount: payload?.amount !== undefined ? Number(payload.amount) : undefined,
    currency: payload?.currency ? String(payload.currency).toLowerCase() : undefined,
    provider: payload?.provider,
    paymentMethod: payload?.paymentMethod,
    createdAt: new Date().toISOString(),
    confirmedAt: new Date().toISOString(),
  });

  return createdBooking;
}

function getBookings(userId) {
  const allBookings = getAllBookings();
  if (!userId) {
    return allBookings;
  }

  return allBookings.filter((booking) => String(booking.userId) === String(userId));
}

function getBooking(bookingId) {
  return getBookingById(bookingId);
}

async function cancelBooking(bookingId) {
  const existingBooking = getBookingById(bookingId);

  if (!existingBooking) {
    const notFoundError = new Error("Booking not found");
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  if (existingBooking.status === "CANCELLED") {
    const alreadyCancelledError = new Error("Booking is already cancelled");
    alreadyCancelledError.statusCode = 400;
    throw alreadyCancelledError;
  }

  return updateBookingById(bookingId, {
    status: "CANCELLED",
    cancelledAt: new Date().toISOString(),
  });
}

async function updateBookingStatus(bookingId, payload) {
  const existingBooking = getBookingById(bookingId);

  if (!existingBooking) {
    const notFoundError = new Error("Booking not found");
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  const nextStatus = String(payload?.status || "").toUpperCase();
  const allowedStatuses = ["PENDING_PAYMENT", "CONFIRMED", "PAYMENT_FAILED", "CANCELLED"];

  if (!allowedStatuses.includes(nextStatus)) {
    const validationError = new Error("Invalid status value");
    validationError.statusCode = 400;
    throw validationError;
  }

  const updateData = {
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };

  if (payload.paymentId) updateData.paymentId = payload.paymentId;
  if (payload.paymentStatus) updateData.paymentStatus = String(payload.paymentStatus).toUpperCase();
  if (payload.failureReason) updateData.failureReason = payload.failureReason;
  if (payload.amount !== undefined) updateData.amount = Number(payload.amount);
  if (payload.currency) updateData.currency = String(payload.currency).toLowerCase();
  if (payload.provider) updateData.provider = payload.provider;
  if (payload.paymentMethod) updateData.paymentMethod = payload.paymentMethod;

  if (nextStatus === "CONFIRMED") {
    updateData.confirmedAt = new Date().toISOString();
  }

  if (nextStatus === "PAYMENT_FAILED") {
    updateData.failedAt = new Date().toISOString();
  }

  if (nextStatus === "CANCELLED") {
    updateData.cancelledAt = new Date().toISOString();
  }

  return updateBookingById(bookingId, updateData);
}

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  updateBookingStatus,
};
