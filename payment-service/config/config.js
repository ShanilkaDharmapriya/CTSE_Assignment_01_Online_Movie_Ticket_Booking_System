module.exports = {
  PORT: parseInt(process.env.PORT || "4004", 10),
  MONGO_URI: process.env.MONGO_URI || "mongodb://payment-db:27017/payment-db",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_CURRENCY: process.env.STRIPE_CURRENCY || "usd",
  MOVIE_SERVICE_URL: process.env.MOVIE_SERVICE_URL || "http://movie-service:4001",
  SHOW_SERVICE_URL: process.env.SHOW_SERVICE_URL || "http://show-service:4002",
  BOOKING_SERVICE_URL: process.env.BOOKING_SERVICE_URL || "http://booking-service:4003",
  INTERNAL_SERVICE_KEY: process.env.INTERNAL_SERVICE_KEY || "ctse-internal-service-key-2026",
};
