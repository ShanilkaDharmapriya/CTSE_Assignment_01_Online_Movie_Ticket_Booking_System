require("dotenv").config();

const express = require("express");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
const PORT = process.env.PORT || 4003;

app.use(express.json());
app.use(bookingRoutes);

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

app.listen(PORT, () => {
  console.log(`Booking Service running on port ${PORT}`);
});
