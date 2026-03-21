const { v4: uuidv4 } = require("uuid");
const Booking = require("../models/Booking");
const {
  getMovieById,
  getShowById,
  reserveShowSeats,
  freeShowSeats,
  createPayment,
  refundPayment,
} = require("./externalServices");
const { sendBookingConfirmation, sendCancellationNotification } = require("./notificationService");

function convertToNumber(value) {
  const parsedNumber = Number(value);
  return Number.isNaN(parsedNumber) ? null : parsedNumber;
}

/**
 * Generate unique booking reference: BK-YYYY-XXXXX
 */
function generateBookingReference() {
  const year = new Date().getFullYear();
  const randomNum = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
  return `BK-${year}-${randomNum}`;
}

function validateNewBookingInput(payload) {
  const { movieId, showId, seats } = payload || {};
  const requestedSeatCount = convertToNumber(seats);

  // Basic input check to stop invalid requests early (userId comes from JWT, not body).
  if (!movieId || !showId || !Number.isInteger(requestedSeatCount) || requestedSeatCount <= 0) {
    const validationError = new Error(
      "Invalid input: movieId, showId and positive integer seats are required"
    );
    validationError.statusCode = 400;
    throw validationError;
  }

  return { movieId, showId, seats: requestedSeatCount };
}

async function createBooking(payload, authenticatedUserId, authHeader) {
  const { movieId, showId, seats } = validateNewBookingInput(payload);
  const userId = String(authenticatedUserId);

  // Check movie exists before making a booking.
  let movieDetails;
  try {
    movieDetails = await getMovieById(movieId);
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

  // Make sure requested seats are available (before atomic reserve).
  if (convertToNumber(showDetails.availableSeats) < seats) {
    const seatError = new Error("Not enough seats available");
    seatError.statusCode = 400;
    throw seatError;
  }

  const pricePerSeat =
    convertToNumber(showDetails.price) || convertToNumber(movieDetails.pricePerSeat) || 0;
  const paymentAmount = pricePerSeat * seats;

  const bookingId = uuidv4();
  const bookingReference = generateBookingReference();

  // Atomically reserve seats in Show Service (holds inventory until payment completes).
  try {
    await reserveShowSeats(showId, seats);
  } catch (error) {
    const seatError = new Error("Not enough seats available");
    seatError.statusCode = 400;
    throw seatError;
  }

  const bookingRecord = new Booking({
    _id: bookingId,
    bookingReference,
    userId,
    movieId,
    showId,
    seats,
    amount: paymentAmount,
    status: "PENDING",
    movieTitle: movieDetails.title,
    theaterName: showDetails.theater,
    showDateTime: showDetails.date,
    notificationSent: false,
  });

  try {
    await bookingRecord.save();
  } catch (saveError) {
    await freeShowSeats(showId, seats).catch(() => {});
    throw saveError;
  }

  let paymentData;
  try {
    paymentData = await createPayment(
      {
        bookingId,
        userId,
        movieId,
        showId,
        seats,
        amount: paymentAmount,
      },
      authHeader
    );
  } catch (error) {
    bookingRecord.status = "CANCELLED";
    await bookingRecord.save();
    await freeShowSeats(showId, seats).catch(() => {});
    const paymentError = new Error("Payment failed");
    paymentError.statusCode = error.response?.status === 402 ? 402 : 500;
    throw paymentError;
  }

  const payId = paymentData.paymentId || paymentData._id;
  bookingRecord.paymentId = payId ? String(payId) : null;
  bookingRecord.status = "CONFIRMED";
  await bookingRecord.save();

  sendBookingConfirmation(bookingId).catch((err) =>
    console.error("Notification error (non-blocking):", err)
  );

  return bookingRecord;
}

/**
 * Get bookings for a specific user (privacy-protected)
 */
async function getBookings(userId, filter = {}) {
  // User ID is required to prevent data leakage
  if (!userId) {
    const error = new Error("User ID required");
    error.statusCode = 400;
    throw error;
  }

  // Always filters by userId
  const query = { userId, ...filter };
  return Booking.find(query).sort({ createdAt: -1 });
}

/**
 * Get a specific booking (with user verification)
 */
async function getBookingById(bookingId, userId) {
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  // Verify user owns this booking
  if (String(booking.userId) !== String(userId)) {
    const error = new Error("Unauthorized - booking does not belong to user");
    error.statusCode = 403;
    throw error;
  }

  return booking;
}

/**
 * Cancel booking and refund payment
 */
async function cancelBooking(bookingId, userId, cancellationReason = "User requested", authHeader) {
  const booking = await getBookingById(bookingId, userId);

  if (booking.status === "CANCELLED") {
    const error = new Error("Booking is already cancelled");
    error.statusCode = 400;
    throw error;
  }

  // Pending booking: no payment yet — release held seats only
  if (booking.status === "PENDING") {
    try {
      await freeShowSeats(booking.showId, booking.seats);
    } catch (seatError) {
      console.error("Failed to free seats:", seatError.message);
    }
    booking.status = "CANCELLED";
    booking.cancellationReason = cancellationReason;
    const updatedBooking = await booking.save();
    sendCancellationNotification(bookingId).catch((err) =>
      console.error("Notification error (non-blocking):", err)
    );
    return updatedBooking;
  }

  if (booking.status !== "CONFIRMED") {
    const error = new Error("Booking cannot be cancelled");
    error.statusCode = 400;
    throw error;
  }

  if (booking.paymentId) {
    try {
      await refundPayment(booking.paymentId, authHeader);
      booking.refundStatus = "SUCCESS";
      booking.refundedAmount = booking.amount;
      booking.refundedAt = new Date();
    } catch (refundError) {
      console.error("Refund failed:", refundError.message);
      booking.refundStatus = "FAILED";
    }
  }

  try {
    await freeShowSeats(booking.showId, booking.seats);
  } catch (seatError) {
    console.error("Failed to update seats:", seatError.message);
  }

  booking.status = "CANCELLED";
  booking.cancellationReason = cancellationReason;
  const updatedBooking = await booking.save();

  sendCancellationNotification(bookingId).catch((err) =>
    console.error("Notification error (non-blocking):", err)
  );

  return updatedBooking;
}

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking
};
