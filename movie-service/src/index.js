require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const connectDB = require("../config/db");
const { PORT } = require("../config/config");
const swaggerSpec = require("../config/swagger");
const movieRoutes = require("../routes/movieRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/movies", movieRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Movie Service is running" });
});

// Start API even if DB is unavailable, so health and non-DB routes remain reachable.
connectDB().then((isDbConnected) => {
  if (!isDbConnected) {
    console.warn("Starting movie-service without a database connection.");
  }
  const server = app.listen(PORT, () => {
    console.log(`Movie Service running on port ${PORT}`);
  });
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Stop the existing movie-service process before starting a new one.`
      );
      process.exit(1);
    }
    console.error("Server failed to start:", error);
    process.exit(1);
  });
});