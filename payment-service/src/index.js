require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("../config/db");
const { PORT } = require("../config/config");
const paymentRoutes = require("../routes/paymentRoutes");
const { processPayment } = require("../controllers/paymentController");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/payments", paymentRoutes);
app.post("/pay", processPayment);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "Payment Service is running" });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
});