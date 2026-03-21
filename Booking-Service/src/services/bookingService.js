const { v4: uuidv4 } = require("uuid");
const Booking = require("../models/Booking");
const {
  getMovieById,
  getShowById,
  createPayment,
  reduceShowSeats
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
  const showPrice = convertToNumber(showDetails.price);
  const ticketPrice = showPrice || 0;
  const paymentAmount = ticketPrice * seats;

  // Save booking in PENDING state before payment.
  const bookingRecord = new Booking({
    _id: bookingId,
    userId,
    movieId,
    showId,
    seats,
    status: "PENDING"
  });
  await bookingRecord.save();

  // Process payment after booking creation.
  try {
    const paymentResult = await createPayment({
      bookingId,
      userId,
      movieId,
      showId,
      seats,
      amount: paymentAmount,
      ticketPrice
    });

    if (paymentResult.paymentStatus !== "SUCCESS") {
      bookingRecord.status = "FAILED";
      await bookingRecord.save();
      const paymentFailureError = new Error("Payment failed");
      paymentFailureError.statusCode = 402;
      throw paymentFailureError;
    }
  } catch (error) {
    bookingRecord.status = "FAILED";
    await bookingRecord.save();
    const paymentError = new Error("Payment failed");
    paymentError.statusCode = error.statusCode || error.response?.status || 500;
    throw paymentError;
  }

  // Reduce seats only after successful payment.
  try {
    await reduceShowSeats(showId, seats);
  } catch (error) {
    bookingRecord.status = "FAILED";
    await bookingRecord.save();
    const seatUpdateError = new Error("Failed to reserve seats after payment");
    seatUpdateError.statusCode = 500;
    throw seatUpdateError;
  }

  bookingRecord.status = "CONFIRMED";
  const savedBooking = await bookingRecord.save();

  return savedBooking;
}

async function getBookings(filters = {}) {
  // Read all bookings from MongoDB database.
  const query = {};
  if (filters.userId) {
    query.userId = filters.userId;
  }
  return Booking.find(query);
}

async function getBookingById(bookingId) {
  // Read one booking from MongoDB using its id.
  return Booking.findById(bookingId);
}

async function cancelBookingById(bookingId) {
  const bookingRecord = await Booking.findById(bookingId);
  if (!bookingRecord) {
    return null;
  }
  bookingRecord.status = "CANCELLED";
  return bookingRecord.save();
}

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBookingById
};
