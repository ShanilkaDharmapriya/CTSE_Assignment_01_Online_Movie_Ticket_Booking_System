const axios = require("axios");
const Booking = require("../models/Booking");
const {
  MOVIE_SERVICE_URL,
  SHOW_SERVICE_URL,
  PAYMENT_SERVICE_URL,
} = require("../config/config");

const getSeatCount = (body) => Number(body.seatCount ?? body.seats);

const refundPayment = async (paymentId, amount) => {
  const response = await axios.post(`${PAYMENT_SERVICE_URL}/payments/${paymentId}/refund`, {
    amount,
  });
  return response.data;
};

const getMovie = async (movieId) => {
  const response = await axios.get(`${MOVIE_SERVICE_URL}/movies/${movieId}`);
  if (!response.data) {
    throw new Error("Movie not found");
  }
  return response.data;
};

const getShow = async (showId) => {
  const response = await axios.get(`${SHOW_SERVICE_URL}/shows/${showId}`);
  return response.data;
};

const getSeatInfo = async (showId) => {
  const response = await axios.get(`${SHOW_SERVICE_URL}/shows/${showId}/seats`);
  return response.data;
};

const updateShowSeats = async (showId, availableSeats, reservedSeats) => {
  await axios.put(`${SHOW_SERVICE_URL}/shows/${showId}`, {
    availableSeats,
    reservedSeats,
  }, {
    headers: { "X-Service-Key": process.env.INTERNAL_SERVICE_KEY || "" },
  });
};

// POST /bookings
const createBooking = async (req, res) => {
  const seats = getSeatCount(req.body);

  if (!req.body.userId || !req.body.movieId || !req.body.showId || !Number.isInteger(seats) || seats < 1) {
    return res.status(400).json({
      message: "userId, movieId, showId and a positive seats value are required",
    });
  }

  try {
    const [movie, show, seatInfo] = await Promise.all([
      getMovie(req.body.movieId),
      getShow(req.body.showId),
      getSeatInfo(req.body.showId),
    ]);

    if (String(show.movieId) !== String(req.body.movieId)) {
      return res.status(400).json({ message: "Show does not belong to the specified movie" });
    }

    if (seatInfo.availableSeats < seats) {
      return res.status(400).json({ message: "Not enough seats available for this show" });
    }

    const currency = String(req.body.currency || "usd").toLowerCase();
    const booking = new Booking({
      userId: req.body.userId,
      movieId: req.body.movieId,
      showId: req.body.showId,
      seats,
      amount: 0,
      currency,
      paymentStatus: "PENDING",
      bookingStatus: "PENDING",
    });

    const savedBooking = await booking.save();

    let paymentResponse;
    try {
      paymentResponse = await axios.post(`${PAYMENT_SERVICE_URL}/payments`, {
        bookingId: savedBooking._id,
        movieId: req.body.movieId,
        showId: req.body.showId,
        userId: req.body.userId,
        seats,
        currency,
        paymentMethod: req.body.paymentMethod,
        paymentMethodId: req.body.paymentMethodId,
      });
    } catch (error) {
      savedBooking.paymentStatus = "FAILED";
      savedBooking.bookingStatus = "FAILED";
      await savedBooking.save();
      return res.status(error.response?.status || 502).json({
        message: "Payment processing failed",
        error: error.message,
        details: error.response?.data,
      });
    }

    if (paymentResponse.data.paymentStatus !== "SUCCESS") {
      savedBooking.paymentStatus = paymentResponse.data.paymentStatus || "FAILED";
      savedBooking.bookingStatus = "FAILED";
      savedBooking.amount = Number(paymentResponse.data.amount || 0);
      await savedBooking.save();
      return res.status(402).json({
        message: "Payment was not completed",
        payment: paymentResponse.data,
      });
    }

    savedBooking.amount = Number(paymentResponse.data.amount || 0);
    savedBooking.currency = paymentResponse.data.currency || currency;
    savedBooking.paymentId = paymentResponse.data.paymentId || null;
    savedBooking.paymentStatus = paymentResponse.data.paymentStatus || "SUCCESS";
    savedBooking.bookingStatus = "CONFIRMED";
    await savedBooking.save();

    res.status(201).json({
      booking: savedBooking,
      confirmation: {
        movieName: movie.title,
        showTime: show.showTime,
        seats: savedBooking.seats,
        payment: {
          paymentId: savedBooking.paymentId,
          amount: savedBooking.amount,
          currency: savedBooking.currency,
          paymentStatus: savedBooking.paymentStatus,
        },
      },
    });
  } catch (error) {
    const statusCode = error.response?.status === 404 ? 404 : 400;
    res.status(statusCode).json({ message: "Failed to create booking", error: error.message });
  }
};

// GET /bookings
const getAllBookings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.movieId) filter.movieId = req.query.movieId;
    if (req.query.showId) filter.showId = req.query.showId;
    if (req.query.bookingStatus) filter.bookingStatus = req.query.bookingStatus;

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve bookings", error: error.message });
  }
};

// GET /bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve booking", error: error.message });
  }
};

// DELETE /bookings/:id
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.bookingStatus === "CANCELLED") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    if (booking.bookingStatus !== "CONFIRMED") {
      return res.status(400).json({ message: "Only confirmed bookings can be cancelled" });
    }

    if (booking.paymentId && booking.paymentStatus === "SUCCESS") {
      const refundResponse = await refundPayment(booking.paymentId, booking.amount);
      booking.paymentStatus = refundResponse.paymentStatus || "REFUNDED";
    }

    const seatInfo = await getSeatInfo(booking.showId);
    await updateShowSeats(
      booking.showId,
      seatInfo.availableSeats + booking.seats,
      Math.max(seatInfo.reservedSeats - booking.seats, 0)
    );

    booking.bookingStatus = "CANCELLED";
    booking.cancelledAt = new Date();
    await booking.save();

    res.status(200).json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel booking", error: error.message });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking,
};