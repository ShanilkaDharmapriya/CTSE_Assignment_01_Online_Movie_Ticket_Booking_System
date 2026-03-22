const mongoose = require("mongoose");

const SHOW_STATUSES = ["ACTIVE", "COMPLETED", "CANCELLED"];

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: String,
      required: [true, "Movie ID is required"],
    },
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: [true, "Theater is required"],
    },
    startTime: {
      type: Date,
      required: [true, "startTime is required"],
    },
    endTime: {
      type: Date,
      required: [true, "endTime is required"],
    },
    layoutVersionUsed: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: SHOW_STATUSES,
      default: "ACTIVE",
      required: true,
    },
    /** Denormalized counts — updated by seat aggregate sync */
    availableSeats: {
      type: Number,
      default: 0,
      min: 0,
    },
    reservedSeats: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

showSchema.index({ theaterId: 1, startTime: 1, endTime: 1 });
showSchema.index({ movieId: 1, status: 1 });
showSchema.index({ status: 1, endTime: 1 });

module.exports = {
  Show: mongoose.models.Show || mongoose.model("Show", showSchema),
  SHOW_STATUSES,
};
