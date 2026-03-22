const axios = require("axios");

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || "http://payment-service:4004";

// POST /payments
const processPayment = async (req, res) => {
  try {
    const paymentPayload = {
      ...req.body,
      userId: req.body.userId || req.auth?.user?.id,
    };

    if (!paymentPayload.userId) {
      return res.status(401).json({ message: "Authenticated user ID is required" });
    }

    const response = await axios.post(`${PAYMENT_SERVICE_URL}/payments`, paymentPayload);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Payment processing failed", error: error.message });
  }
};

// GET /payments
const getAllPayments = async (req, res) => {
  try {
    const response = await axios.get(`${PAYMENT_SERVICE_URL}/payments`, { params: req.query });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch payments", error: error.message });
  }
};

// GET /payments/:id  — get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const response = await axios.get(`${PAYMENT_SERVICE_URL}/payments/${req.params.id}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch payment status", error: error.message });
  }
};

module.exports = { processPayment, getAllPayments, getPaymentStatus };
