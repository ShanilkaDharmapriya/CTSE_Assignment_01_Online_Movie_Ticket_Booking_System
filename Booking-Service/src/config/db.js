const mongoose = require("mongoose");

async function connectToDatabase() {
  const uri = process.env.BOOKING_MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/booking-db";
  await mongoose.connect(uri);
  console.log("booking-service: MongoDB connected");
}

module.exports = { connectToDatabase };
