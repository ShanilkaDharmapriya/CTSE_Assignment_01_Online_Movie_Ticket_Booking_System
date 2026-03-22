const path = require("path");
// Repo root .env (PAYMENT_MONGO_URI) then service-local .env overrides
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
require("dotenv").config({ path: path.join(__dirname, "../.env") });
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

app.use("/payments", paymentRoutes);
app.post("/pay", processPayment);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "Payment Service is running" });
});

connectDB().then(() => {
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