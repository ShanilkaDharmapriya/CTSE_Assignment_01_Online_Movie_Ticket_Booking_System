require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const connectDB = require("../config/db");
const { PORT } = require("../config/config");
const swaggerSpec = require("../config/swagger");
const showRoutes = require("../routes/showRoutes");
const theaterRoutes = require("../routes/theaterRoutes");
const seatRoutes = require("../routes/seatRoutes");
const internalSeatRoutes = require("../routes/internalSeatRoutes");
const internalShowRoutes = require("../routes/internalShowRoutes");
const { releaseExpiredHolds } = require("../services/seatService");
const { completePastShows } = require("../services/showLifecycle");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (seat + internal before /shows is not required; mount at root paths)
app.use("/theaters", theaterRoutes);
app.use("/seats", seatRoutes);
app.use("/internal/seats", internalSeatRoutes);
app.use("/internal/shows", internalShowRoutes);
app.use("/shows", showRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Show Service is running" });
});

// Connect to MongoDB then start server
connectDB().then(() => {
  const RELEASE_INTERVAL_MS = 60 * 1000;
  setInterval(() => {
    releaseExpiredHolds()
      .then(({ modifiedCount }) => {
        if (modifiedCount > 0) {
          console.log(`[ShowService] Expired seat holds released: ${modifiedCount}`);
        }
      })
      .catch((err) => console.error("[ShowService] releaseExpiredHolds error:", err.message));
  }, RELEASE_INTERVAL_MS);

  const COMPLETE_SHOWS_MS = 2 * 60 * 1000;
  setInterval(() => {
    completePastShows()
      .then(({ modifiedCount }) => {
        if (modifiedCount > 0) {
          console.log(`[ShowService] Shows marked COMPLETED: ${modifiedCount}`);
        }
      })
      .catch((err) => console.error("[ShowService] completePastShows error:", err.message));
  }, COMPLETE_SHOWS_MS);

  app.listen(PORT, () => {
    console.log(`Show Service running on port ${PORT}`);
  });
});