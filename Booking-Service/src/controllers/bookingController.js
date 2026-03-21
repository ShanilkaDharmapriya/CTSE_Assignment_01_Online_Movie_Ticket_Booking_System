const { createBooking, getBookings, getBooking } = require("../services/bookingService");

async function createBookingHandler(req, res, next) {
  try {
    const booking = await createBooking(req.body);
    return res.status(201).json(booking);
  } catch (error) {
    return next(error);
  }
}

function getAllBookingsHandler(req, res) {
  return res.status(200).json(getBookings());
}

function getBookingByIdHandler(req, res) {
  const booking = getBooking(req.params.bookingId);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }
  return res.status(200).json(booking);
}

module.exports = {
  createBookingHandler,
  getAllBookingsHandler,
  getBookingByIdHandler
};
