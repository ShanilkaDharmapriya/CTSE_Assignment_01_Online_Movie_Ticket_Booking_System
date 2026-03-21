const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const { processPayment, getAllPayments, getPaymentStatus } = require("../controllers/paymentController");

// POST /payments           — process a payment
router.post("/", requireAuth, processPayment);

// GET  /payments           — list payments
router.get("/", requireAuth, getAllPayments);

// GET  /payments/:id       — get payment status
router.get("/:id", requireAuth, getPaymentStatus);

module.exports = router;
