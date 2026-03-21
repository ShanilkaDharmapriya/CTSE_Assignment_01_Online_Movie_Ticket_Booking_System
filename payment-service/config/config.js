require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 4004,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/payment-db",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_CURRENCY: process.env.STRIPE_CURRENCY || "usd",
  MOVIE_SERVICE_URL: process.env.MOVIE_SERVICE_URL || "http://localhost:4001",
  SHOW_SERVICE_URL: process.env.SHOW_SERVICE_URL || "http://localhost:4002",
  BOOKING_SERVICE_URL: process.env.BOOKING_SERVICE_URL || "http://localhost:4003",
};