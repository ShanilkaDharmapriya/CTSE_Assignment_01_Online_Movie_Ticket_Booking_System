require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { connectToDatabase } = require("./config/db");
const bookingRoutes = require("./routes/bookingRoutes");
const swaggerSpec = require("./config/swagger");
const { PORT } = require("../config/config");

const app = express();

app.use(express.json());
app.use(bookingRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "booking-service" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  return res.status(statusCode).json({ message });
});

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Booking Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("booking-service: MongoDB connection failed:", err.message);
    process.exit(1);
  });
