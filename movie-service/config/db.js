const mongoose = require("mongoose");
const { MONGO_URI } = require("./config");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("Database connected");
    return true;
  } catch (error) {
    // When running locally, docker hostnames like "movie-db" may not resolve.
    if (MONGO_URI.includes("movie-db") && error?.message?.includes("ENOTFOUND movie-db")) {
      const localMongoUri = MONGO_URI.replace("movie-db", "localhost");
      try {
        console.warn(
          `Primary Mongo host not reachable (${MONGO_URI}). Retrying with ${localMongoUri}...`
        );
        await mongoose.connect(localMongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log("Database connected");
        return true;
      } catch (fallbackError) {
        console.error("DB connection failed:", fallbackError);
        return false;
      }
    }
    console.error("DB connection failed:", error);
    return false;
  }
};

module.exports = connectDB;