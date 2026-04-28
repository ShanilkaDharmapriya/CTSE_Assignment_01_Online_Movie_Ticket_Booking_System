const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Movie title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    genre: {
      type: [String],
      required: [true, "At least one genre is required"],
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      trim: true,
    },
    duration: {
      // duration in minutes
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    director: {
      type: String,
      required: [true, "Director is required"],
      trim: true,
    },
    cast: {
      type: [String],
      default: [],
    },
    releaseDate: {
      type: Date,
      required: [true, "Release date is required"],
    },
    poster: {
      data: {
        type: Buffer,
        default: null,
      },
      contentType: {
        type: String,
        default: "",
      },
      fileName: {
        type: String,
        default: "",
      },
    },
    rating: {
      // e.g. 8.5 out of 10
      type: Number,
      min: [0, "Rating cannot be below 0"],
      max: [10, "Rating cannot exceed 10"],
      default: 0,
    },
    pricePerSeat: {
      // base price; shows can override this
      type: Number,
      required: [true, "Price per seat is required"],
      min: [0, "Price cannot be negative"],
    },
    status: {
      type: String,
      enum: ["now_showing", "coming_soon", "ended"],
      default: "coming_soon",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
