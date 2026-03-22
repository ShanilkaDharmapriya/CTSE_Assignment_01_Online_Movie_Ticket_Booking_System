const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    movieId: {
      type: String,
      required: true,
    },
    showId: {
      type: String,
      required: true,
    },
    seats: {
      type: [String],
      required: true,
      validate: [(arr) => Array.isArray(arr) && arr.length > 0, "At least one seat required"],
    },
    paymentId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "CONFIRMED", "PAYMENT_FAILED", "CANCELLED"],
      default: "CONFIRMED",
    },
    failureReason: { type: String, default: null },
    /** Snapshot for “My bookings” without extra service calls */
    movieTitle: { type: String, default: "" },
    theaterName: { type: String, default: "" },
    showStartTime: { type: Date, default: null },
    paymentStatus: { type: String, default: "SUCCESS" },
    amount: { type: Number },
    currency: { type: String, lowercase: true },
    provider: { type: String },
    paymentMethod: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
