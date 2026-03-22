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

function updateBookingById(bookingId, changes) {
  const bookingIndex = bookingRecords.findIndex((booking) => booking.bookingId === bookingId);
  if (bookingIndex === -1) {
    return null;
  }

  bookingRecords[bookingIndex] = {
    ...bookingRecords[bookingIndex],
    ...changes,
  };

  return bookingRecords[bookingIndex];
}

module.exports = {
  addBooking,
  getAllBookings,
  getBookingById,
  updateBookingById
};
