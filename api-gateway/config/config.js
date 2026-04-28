module.exports = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || "http://auth-service:5000",
  MOVIE_SERVICE_URL: process.env.MOVIE_SERVICE_URL || "http://movie-service:4001",
  SHOW_SERVICE_URL: process.env.SHOW_SERVICE_URL || "http://show-service:4002",
  BOOKING_SERVICE_URL: process.env.BOOKING_SERVICE_URL || "http://booking-service:4003",
  PAYMENT_SERVICE_URL: process.env.PAYMENT_SERVICE_URL || "http://payment-service:4004",
};
