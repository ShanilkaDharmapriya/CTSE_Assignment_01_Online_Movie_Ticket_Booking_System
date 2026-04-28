const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: [true, "Booking ID is required"],
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
      trim: true,
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
      min: [1, "Seat count must be at least 1"],
    },
    seatNumbers: {
      type: [String],
      default: [],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "usd",
      trim: true,
      lowercase: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      default: "stripe",
      trim: true,
      lowercase: true,
    },
    provider: {
      type: String,
      enum: ["stripe", "mock"],
      default: "stripe",
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    clientSecret: {
      type: String,
      default: null,
    },
    refundId: {
      type: String,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);