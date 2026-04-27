require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const connectDB = require("../config/db");
const { PORT } = require("../config/config");
const paymentRoutes = require("../routes/paymentRoutes");
const swaggerSpec = require("../config/swagger");
const { processPayment } = require("../controllers/paymentController");

const app = express();
app.use(cors());
app.use(express.json());

// Primary payment API surface.
app.use("/payments", paymentRoutes);
// Backward-compatible direct payment endpoint used by some older clients.
app.post("/pay", processPayment);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "Payment Service is running" });
});

connectDB().then(() => {
  // Start serving only after MongoDB connection succeeds.
  const server = app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Stop the existing payment-service process before starting a new one.`
      );
      process.exit(1);
    }
    console.error("Server failed to start:", error);
    process.exit(1);
  });
});
