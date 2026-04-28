const mongoose = require("mongoose");
const { MONGO_URI } = require("../../config/config");

async function connectToDatabase() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }
  await mongoose.connect(MONGO_URI);
  console.log("booking-service: MongoDB connected");
}

module.exports = { connectToDatabase };
