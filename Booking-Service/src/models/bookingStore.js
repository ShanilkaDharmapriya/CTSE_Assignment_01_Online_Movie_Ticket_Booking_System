const bookings = [];

function addBooking(booking) {
  bookings.push(booking);
  return booking;
}

function getAllBookings() {
  return bookings;
}

function getBookingById(bookingId) {
  return bookings.find((booking) => booking.bookingId === bookingId);
}

module.exports = {
  addBooking,
  getAllBookings,
  getBookingById
};
