const mongoose = require("mongoose");
const { MONGO_URI } = require("./config");

async function connectToDatabase() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  await mongoose.connect(MONGO_URI);
}

module.exports = {
  connectToDatabase,
};
