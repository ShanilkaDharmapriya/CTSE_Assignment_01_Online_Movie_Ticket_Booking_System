const bookingRecords = [];

function addBooking(booking) {
  bookingRecords.push(booking);
  return booking;
}

function getAllBookings() {
  return bookingRecords;
}

function getBookingById(bookingId) {
  return bookingRecords.find((booking) => booking.bookingId === bookingId);
}

module.exports = {
  addBooking,
  getAllBookings,
  getBookingById
};
