const mongoose = require("mongoose");

const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Theater name is required"],
      trim: true,
      maxlength: 200,
    },
    rows: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0 && arr.every((r) => String(r).trim()),
        message: "At least one row label is required (e.g. A, B, C)",
      },
    },
    seatsPerRow: {
      type: Number,
      required: true,
      min: [1, "seatsPerRow must be at least 1"],
      max: [200, "seatsPerRow cannot exceed 200"],
    },
    layoutVersion: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
  },
  { timestamps: true }
);

theaterSchema.index({ name: 1 });

module.exports = mongoose.models.Theater || mongoose.model("Theater", theaterSchema);
