const mongoose = require("mongoose");

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: String,
      required: [true, "Movie ID is required"],
    },
    movieTitle: {
      type: String,
      required: [true, "Movie title is required"],
      trim: true,
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
    totalSeats: {
      type: Number,
      required: [true, "Total seats is required"],
      min: [1, "Total seats must be at least 1"],
    },
    availableSeats: {
      type: Number,
      required: [true, "Available seats is required"],
      min: [0, "Available seats cannot be negative"],
    },
    pricePerSeat: {
      type: Number,
      required: [true, "Price per seat is required"],
      min: [0, "Price cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "completed"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Show", showSchema);
