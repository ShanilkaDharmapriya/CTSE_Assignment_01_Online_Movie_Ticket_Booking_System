const Booking = require("../models/Booking");

/**
 * Send booking confirmation notification
 * Sends confirmation email with booking details to the user
 */
async function sendBookingConfirmation(bookingId) {
  try {
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      console.error(`Booking ${bookingId} not found for notification`);
      return false;
    }

    // Check if notification already sent to prevent duplicates
    if (booking.notificationSent) {
      console.warn(`Notification already sent for booking ${bookingId}`);
      return true;
    }

    // Format booking details for notification
    const notificationPayload = {
      userId: booking.userId,
      bookingReference: booking.bookingReference,
      movieTitle: booking.movieTitle,
      theaterName: booking.theaterName,
      showDateTime: booking.showDateTime,
      seatsBooked: booking.seats,
      totalAmount: booking.amount,
      bookingStatus: booking.status,
      bookingDate: booking.createdAt,
    };

    // Log notification (in real system, would call email service)
    console.log("📧 Booking Confirmation Notification Sent:", {
      ...notificationPayload,
      timestamp: new Date().toISOString(),
    });

    // Update booking to mark notification as sent
    booking.notificationSent = true;
    await booking.save();

    return true;
  } catch (error) {
    console.error(`Failed to send booking confirmation for ${bookingId}:`, error.message);
    // Don't throw - notifications should not fail bookings
    return false;
  }
}

/**
 * Send cancellation notification
 * Notifies user about successful cancellation and refund
 */
async function sendCancellationNotification(bookingId) {
  try {
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      console.error(`Booking ${bookingId} not found for cancellation notification`);
      return false;
    }

    const notificationPayload = {
      userId: booking.userId,
      bookingReference: booking.bookingReference,
      movieTitle: booking.movieTitle,
      theaterName: booking.theaterName,
      cancellationReason: booking.cancellationReason,
      refundStatus: booking.refundStatus,
      refundedAmount: booking.refundedAmount,
      cancellationDate: booking.refundedAt || new Date(),
    };

    // Log cancellation notification (in real system, would call email service)
    console.log("📧 Booking Cancellation Notification Sent:", {
      ...notificationPayload,
      timestamp: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error(`Failed to send cancellation notification for ${bookingId}:`, error.message);
    // Don't throw - notifications should not fail cancellations
    return false;
  }
}

module.exports = {
  sendBookingConfirmation,
  sendCancellationNotification,
};
