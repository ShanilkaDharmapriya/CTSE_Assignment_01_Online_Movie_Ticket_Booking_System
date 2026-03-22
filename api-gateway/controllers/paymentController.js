const axios = require("axios");
const { PAYMENT_SERVICE_URL } = require("../config/config");

const buildProxyErrorPayload = (fallbackMessage, error) => {
  const upstream = error.response?.data;
  if (upstream && typeof upstream === "object") {
    return {
      ...upstream,
      message: upstream.message || fallbackMessage,
    };
  }

  return {
    message: fallbackMessage,
    error: error.message,
  };
};

// POST /payments
const processPayment = async (req, res) => {
  try {
    const paymentPayload = {
      ...req.body,
      userId: req.body.userId || req.auth?.user?.id,
    };

    console.log("[Gateway][ProcessPayment] forwarding payload", {
      ...paymentPayload,
      hasUserId: Boolean(paymentPayload.userId),
    });

    if (!paymentPayload.userId) {
      return res.status(401).json({ message: "Authenticated user ID is required" });
    }

    const response = await axios.post(`${PAYMENT_SERVICE_URL}/payments`, paymentPayload);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("[Gateway][ProcessPayment] failed", {
      status: error.response?.status,
      upstreamBody: error.response?.data,
      message: error.message,
    });
    res
      .status(error.response?.status || 500)
      .json(buildProxyErrorPayload("Payment processing failed", error));
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
