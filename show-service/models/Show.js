const mongoose = require("mongoose");

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: String,
      required: [true, "Movie ID is required"],
    },
    theater: {
      type: String,
      required: [true, "Theater/Hall name is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Show date is required"],
    },
    showTime: {
      type: String,
      required: [true, "Show time is required"],
      trim: true,
    },
    availableSeats: {
      type: Number,
      required: [true, "Available seats is required"],
      min: [0, "Available seats cannot be negative"],
    },
    reservedSeats: {
      type: Number,
      required: [true, "Reserved seats is required"],
      min: [0, "Reserved seats cannot be negative"],
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Show", showSchema);
