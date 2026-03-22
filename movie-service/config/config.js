module.exports = {
  PORT: parseInt(process.env.PORT || "4001", 10),
  MONGO_URI: process.env.MONGO_URI || "mongodb://movie-db:27017/movie-db",
  SHOW_SERVICE_URL: process.env.SHOW_SERVICE_URL || "http://show-service:4002",
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || "http://auth-service:5000",
  INTERNAL_SERVICE_KEY: process.env.INTERNAL_SERVICE_KEY || "ctse-internal-service-key-2026",
};
