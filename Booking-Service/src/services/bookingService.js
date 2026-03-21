const { v4: uuidv4 } = require("uuid");
const Booking = require("../models/Booking");
const {
  getMovieById,
  getShowById,
  createPayment,
  refundPayment,
  updateShowSeats
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

  // Make sure requested seats are available.
  if (convertToNumber(showDetails.availableSeats) < seats) {
    const seatError = new Error("Not enough seats available");
    seatError.statusCode = 400;
    throw seatError;
  }

  // Create booking id and calculate payment amount.
  const bookingId = uuidv4();
  const bookingReference = generateBookingReference();
  const paymentAmount = convertToNumber(showDetails.price)
    ? convertToNumber(showDetails.price) * seats
    : seats;

  // Process payment before saving booking.
  let paymentData;
  try {
    paymentData = await createPayment({ bookingId, amount: paymentAmount });
  } catch (error) {
    const paymentError = new Error("Payment failed");
    paymentError.statusCode = 500;
    throw paymentError;
  }

  // Save booking to MongoDB database with full details.
  const bookingRecord = new Booking({
    _id: bookingId,
    bookingReference,
    userId,
    movieId,
    showId,
    seats,
    amount: paymentAmount,
    paymentId: paymentData._id || paymentData.paymentId || null,
    status: "CONFIRMED",
    movieTitle: movieDetails.title,
    theaterName: showDetails.theater,
    showDateTime: showDetails.date,
    notificationSent: false,
  });
  const savedBooking = await bookingRecord.save();

  // Send confirmation notification asynchronously (don't fail booking if notification fails)
  sendBookingConfirmation(bookingId).catch(err => 
    console.error("Notification error (non-blocking):", err)
  );

  return savedBooking;
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
  if (booking.userId !== userId) {
    const error = new Error("Unauthorized - booking does not belong to user");
    error.statusCode = 403;
    throw error;
  }

  return booking;
}

/**
 * Cancel booking and refund payment
 */
async function cancelBooking(bookingId, userId, cancellationReason = "User requested") {
  // Get booking with user verification
  const booking = await getBookingById(bookingId, userId);

  // Check if booking is already cancelled
  if (booking.status === "CANCELLED") {
    const error = new Error("Booking is already cancelled");
    error.statusCode = 400;
    throw error;
  }

  // If booking has a successful payment, refund it
  let refundSuccess = true;
  if (booking.paymentId) {
    try {
      await refundPayment(booking.paymentId);
      booking.refundStatus = "SUCCESS";
      booking.refundedAmount = booking.amount;
      booking.refundedAt = new Date();
    } catch (refundError) {
      console.error("Refund failed:", refundError.message);
      booking.refundStatus = "FAILED";
      refundSuccess = false;
    }
  }

  // Free up seats on the show
  try {
    await updateShowSeats(booking.showId, booking.seats);
  } catch (seatError) {
    console.error("Failed to update seats:", seatError.message);
    // Don't fail the cancellation if seat update fails
  }

  // Update booking status
  booking.status = "CANCELLED";
  booking.cancellationReason = cancellationReason;
  const updatedBooking = await booking.save();

  // Send cancellation notification asynchronously (don't fail cancellation if notification fails)
  sendCancellationNotification(bookingId).catch(err => 
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
