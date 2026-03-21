require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 4001,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/movie-db",
  SHOW_SERVICE_URL: process.env.SHOW_SERVICE_URL || "http://show-service:4002",
};
