const axios = require("axios");

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || "http://localhost:4004";

// POST /payments
const processPayment = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      userId: req.user.userId,
    };
    const response = await axios.post(`${PAYMENT_SERVICE_URL}/payments`, payload);
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ success: false, message: "Payment processing failed" });
  }
};

// GET /payments
const getAllPayments = async (req, res) => {
  try {
    const response = await axios.get(`${PAYMENT_SERVICE_URL}/payments`, { params: req.query });
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ success: false, message: "Failed to fetch payments" });
  }
};

// GET /payments/:id  — get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const response = await axios.get(`${PAYMENT_SERVICE_URL}/payments/${req.params.id}`);
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ success: false, message: "Failed to fetch payment status" });
  }
};

module.exports = { processPayment, getAllPayments, getPaymentStatus };
