const { v4: uuidv4 } = require("uuid");
const {
  addBooking,
  getAllBookings,
  getBookingById
} = require("../models/bookingStore");
const {
  getMovieById,
  getShowById,
  createPayment
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

  // Create booking id and calculate payment amount.
  const bookingId = uuidv4();
  const paymentAmount = convertToNumber(showDetails.price)
    ? convertToNumber(showDetails.price) * seats
    : seats;

  // Process payment before saving booking.
  try {
    await createPayment({ bookingId, amount: paymentAmount });
  } catch (error) {
    const paymentError = new Error("Payment failed");
    paymentError.statusCode = 500;
    throw paymentError;
  }

  // Save final booking record.
  const createdBooking = addBooking({
    bookingId,
    userId,
    movieId,
    showId,
    seats,
    status: "CONFIRMED"
  });

  return createdBooking;
}

function getBookings() {
  return getAllBookings();
}

function getBooking(bookingId) {
  return getBookingById(bookingId);
}

module.exports = {
  createBooking,
  getBookings,
  getBooking
};
