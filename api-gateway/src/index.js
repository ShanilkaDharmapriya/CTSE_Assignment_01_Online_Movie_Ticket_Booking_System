require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const authRoutes    = require("../routes/authRoutes");
const movieRoutes   = require("../routes/movieRoutes");
const showRoutes    = require("../routes/showRoutes");
const bookingRoutes = require("../routes/bookingRoutes");
const paymentRoutes = require("../routes/paymentRoutes");
const seatRoutes = require("../routes/seatRoutes");
const theaterRoutes = require("../routes/theaterRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount service routes
app.use("/auth",     authRoutes);
app.use("/movies",   movieRoutes);
app.use("/theaters", theaterRoutes);
app.use("/shows",    showRoutes);
app.use("/bookings", bookingRoutes);
app.use("/payments", paymentRoutes);
app.use("/seats", seatRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "API Gateway is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));