const mongoose = require("mongoose");

// Booking schema defines how booking data is stored in MongoDB.
const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"]
    },
    movieId: {
      type: String,
      required: [true, "Movie ID is required"]
    },
    showId: {
      type: String,
      required: [true, "Show ID is required"]
    },
    seats: {
      type: Number,
      required: [true, "Seat count is required"],
      min: [1, "Seats must be at least 1"]
    },
    status: {
      type: String,
      required: [true, "Booking status is required"],
      enum: ["PENDING", "CONFIRMED", "FAILED", "CANCELLED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
