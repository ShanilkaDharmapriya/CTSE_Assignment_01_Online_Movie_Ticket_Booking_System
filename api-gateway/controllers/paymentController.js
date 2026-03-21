const axios = require("axios");

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || "http://localhost:4004";

// POST /payments
const processPayment = async (req, res) => {
  try {
    const response = await axios.post(`${PAYMENT_SERVICE_URL}/payments`, req.body);
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

// POST /payments/:id/refund — refund a payment
const refundPayment = async (req, res) => {
  try {
    const response = await axios.post(`${PAYMENT_SERVICE_URL}/payments/${req.params.id}/refund`, req.body);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Payment refund failed", error: error.message });
  }
};

module.exports = { processPayment, getAllPayments, getPaymentStatus, refundPayment };
