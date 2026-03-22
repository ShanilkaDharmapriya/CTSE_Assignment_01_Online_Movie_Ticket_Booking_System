module.exports = {
  PORT: parseInt(process.env.PORT || "4002", 10),
  MONGO_URI: process.env.MONGO_URI || "mongodb://show-db:27017/show-db",
  MOVIE_SERVICE_URL: process.env.MOVIE_SERVICE_URL || "http://movie-service:4001",
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || "http://auth-service:5000",
  INTERNAL_SERVICE_KEY: process.env.INTERNAL_SERVICE_KEY || "ctse-internal-service-key-2026",
};
