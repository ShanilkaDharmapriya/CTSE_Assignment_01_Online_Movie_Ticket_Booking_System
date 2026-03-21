const express = require("express");
const router = express.Router();
const { processPayment, getPaymentStatus } = require("../controllers/paymentController");

// POST /payments           — process a payment
router.post("/", processPayment);

// GET  /payments/:id       — get payment status
router.get("/:id", getPaymentStatus);

module.exports = router;
