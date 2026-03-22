const mongoose = require("mongoose");
const { MONGO_URI } = require("./config");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("Database connected");
    return true;
  } catch (error) {
    console.error("DB connection failed:", error);
    return false;
  }
};

module.exports = connectDB;
