module.exports = {
  PORT: parseInt(process.env.PORT || "4003", 10),
  MONGO_URI: process.env.MONGO_URI || "mongodb://booking-db:27017/booking-db",
  MOVIE_SERVICE_URL: process.env.MOVIE_SERVICE_URL || "http://movie-service:4001",
  SHOW_SERVICE_URL: process.env.SHOW_SERVICE_URL || "http://show-service:4002",
  PAYMENT_SERVICE_URL: process.env.PAYMENT_SERVICE_URL || "http://payment-service:4004",
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || "http://auth-service:5000",
  INTERNAL_SERVICE_KEY: process.env.INTERNAL_SERVICE_KEY || "ctse-internal-service-key-2026",
};
