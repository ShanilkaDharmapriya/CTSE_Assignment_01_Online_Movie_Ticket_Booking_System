const mongoose = require("mongoose");

// Booking schema defines how booking data is stored in MongoDB.
const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    movieId: {
      type: String,
      required: [true, "Movie ID is required"],
    },
    showId: {
      type: String,
      required: [true, "Show ID is required"],
    },
    seats: {
      type: Number,
      required: [true, "Seat count is required"],
      min: [1, "Seats must be at least 1"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    paymentId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "EXPIRED"],
      default: "PENDING",
      index: true,
    },
    movieTitle: {
      type: String,
      default: null,
    },
    theaterName: {
      type: String,
      default: null,
    },
    showDateTime: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    refundStatus: {
      type: String,
      enum: ["NONE", "PENDING", "SUCCESS", "FAILED"],
      default: "NONE",
    },
    refundedAmount: {
      type: Number,
      default: 0,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
