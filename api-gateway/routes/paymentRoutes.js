const express = require("express");
const router = express.Router();
const { processPayment, getAllPayments, getPaymentStatus } = require("../controllers/paymentController");

// POST /payments           — process a payment
router.post("/", processPayment);

// GET  /payments           — list payments
router.get("/", getAllPayments);

// GET  /payments/:id       — get payment status
router.get("/:id", getPaymentStatus);

module.exports = router;
