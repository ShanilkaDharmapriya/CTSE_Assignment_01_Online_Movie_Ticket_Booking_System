const { v4: uuidv4 } = require("uuid");
const { addBooking, getAllBookings, getBookingById } = require("../models/bookingStore");
const { getMovieById, getShowById, createPayment } = require("./externalServices");

function toNumber(value) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function validateCreateBookingInput(payload) {
  const { userId, movieId, showId, seats } = payload || {};
  const seatCount = toNumber(seats);

  if (!userId || !movieId || !showId || !Number.isInteger(seatCount) || seatCount <= 0) {
    const error = new Error("Invalid input: userId, movieId, showId and positive integer seats are required");
    error.statusCode = 400;
    throw error;
  }

  return { userId, movieId, showId, seats: seatCount };
}

async function createBooking(payload) {
  const { userId, movieId, showId, seats } = validateCreateBookingInput(payload);

  try {
    await getMovieById(movieId);
  } catch (error) {
    const err = new Error("Movie not found");
    err.statusCode = 400;
    throw err;
  }

  let show;
  try {
    show = await getShowById(showId);
  } catch (error) {
    const err = new Error("Show not found");
    err.statusCode = 400;
    throw err;
  }

  if (toNumber(show.availableSeats) < seats) {
    const err = new Error("Not enough seats available");
    err.statusCode = 400;
    throw err;
  }

  const bookingId = uuidv4();
  const amount = toNumber(show.price) ? toNumber(show.price) * seats : seats;

  try {
    await createPayment({ bookingId, amount });
  } catch (error) {
    const err = new Error("Payment failed");
    err.statusCode = 500;
    throw err;
  }

  const booking = addBooking({
    bookingId,
    userId,
    movieId,
    showId,
    seats,
    status: "CONFIRMED"
  });

  return booking;
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
