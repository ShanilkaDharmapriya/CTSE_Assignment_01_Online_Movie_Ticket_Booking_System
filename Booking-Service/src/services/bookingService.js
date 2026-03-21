const { v4: uuidv4 } = require("uuid");
const Booking = require("../models/Booking");
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

  // Save booking to MongoDB database.
  const bookingRecord = new Booking({
    _id: bookingId,
    userId,
    movieId,
    showId,
    seats,
    status: "CONFIRMED"
  });
  const savedBooking = await bookingRecord.save();

  return savedBooking;
}

async function getBookings() {
  // Read all bookings from MongoDB database.
  return Booking.find();
}

async function getBookingById(bookingId) {
  // Read one booking from MongoDB using its id.
  return Booking.findById(bookingId);
}

async function cancelBooking(bookingId) {
  // Validate booking exists
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  // Check if booking is already cancelled
  if (booking.status === "CANCELLED") {
    const error = new Error("Booking is already cancelled");
    error.statusCode = 400;
    throw error;
  }

  // Update booking status to CANCELLED
  booking.status = "CANCELLED";
  const updatedBooking = await booking.save();

  return updatedBooking;
}

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking
};
