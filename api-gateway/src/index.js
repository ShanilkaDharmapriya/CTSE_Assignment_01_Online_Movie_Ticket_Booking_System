require("dotenv").config();
const express = require("express");
const cors = require("cors");

const movieRoutes   = require("../routes/movieRoutes");
const showRoutes    = require("../routes/showRoutes");
const bookingRoutes = require("../routes/bookingRoutes");
const paymentRoutes = require("../routes/paymentRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount service routes
app.use("/movies",   movieRoutes);
app.use("/shows",    showRoutes);
app.use("/bookings", bookingRoutes);
app.use("/payments", paymentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "API Gateway is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));