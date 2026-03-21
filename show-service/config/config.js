require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 4002,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/show-db",
  MOVIE_SERVICE_URL: process.env.MOVIE_SERVICE_URL || "http://localhost:4001",
};
