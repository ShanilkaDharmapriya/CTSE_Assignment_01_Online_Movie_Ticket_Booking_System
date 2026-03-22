const mongoose = require("mongoose");

const SEAT_STATUSES = ["AVAILABLE", "HELD", "BOOKED"];

const showSeatSchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
      index: true,
    },
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: SEAT_STATUSES,
      default: "AVAILABLE",
      required: true,
    },
    heldBy: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

showSeatSchema.index({ showId: 1, seatNumber: 1 }, { unique: true });
showSeatSchema.index({ status: 1, expiresAt: 1 });

module.exports = {
  ShowSeat: mongoose.models.ShowSeat || mongoose.model("ShowSeat", showSeatSchema),
  SEAT_STATUSES,
};
