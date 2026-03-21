require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("../config/db");
const { PORT } = require("../config/config");
const showRoutes = require("../routes/showRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/shows", showRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Show Service is running" });
});

// Connect to MongoDB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Show Service running on port ${PORT}`);
  });
});