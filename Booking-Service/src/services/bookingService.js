const { v4: uuidv4 } = require("uuid");
const {
  addBooking,
  getAllBookings,
  getBookingById,
  updateBookingById
} = require("../models/bookingStore");
const {
  getMovieById,
  getShowById
} = require("./externalServices");

function convertToNumber(value) {
  const parsedNumber = Number(value);
  return Number.isNaN(parsedNumber) ? null : parsedNumber;
}

function validateNewBookingInput(payload) {
  const { userId, movieId, showId, seats } = payload || {};
  const requestedSeatCount = convertToNumber(seats);

  // Basic input check to stop invalid requests early.
  if (
    !userId ||
    !movieId ||
    !showId ||
    !Number.isInteger(requestedSeatCount) ||
    requestedSeatCount <= 0
  ) {
    const validationError = new Error(
      "Invalid input: userId, movieId, showId and positive integer seats are required"
    );
    validationError.statusCode = 400;
    throw validationError;
  }

  return { userId, movieId, showId, seats: requestedSeatCount };
}

async function createBooking(payload) {
  const { userId, movieId, showId, seats } = validateNewBookingInput(payload);

  // Check movie exists before making a booking.
  try {
    await getMovieById(movieId);
  } catch (error) {
    const movieError = new Error("Movie not found");
    movieError.statusCode = 400;
    throw movieError;
  }

  // Check show exists and use it for seat and amount details.
  let showDetails;
  try {
    showDetails = await getShowById(showId);
  } catch (error) {
    const showError = new Error("Show not found");
    showError.statusCode = 400;
    throw showError;
  }

  // Make sure requested seats are available.
  if (convertToNumber(showDetails.availableSeats) < seats) {
    const seatError = new Error("Not enough seats available");
    seatError.statusCode = 400;
    throw seatError;
  }

  // Create booking id and keep it pending until frontend completes payment.
  const bookingId = uuidv4();

  // Save pending booking record; payment outcome is applied via status update endpoint.
  const createdBooking = addBooking({
    bookingId,
    bookingReference: bookingId,
    userId,
    movieId,
    showId,
    seats,
    status: "PENDING_PAYMENT",
    createdAt: new Date().toISOString(),
  });

  return createdBooking;
}

function getBookings() {
  return getAllBookings();
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
  updateBookingStatus
};
