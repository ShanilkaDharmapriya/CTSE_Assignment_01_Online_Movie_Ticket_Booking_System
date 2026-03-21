const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const { processPayment, getAllPayments, getPaymentStatus, refundPayment } = require("../controllers/paymentController");

// POST /payments           — process a payment (auth required)
router.post("/", requireAuth, processPayment);

// GET  /payments           — list payments (auth required)
router.get("/", requireAuth, getAllPayments);

// GET  /payments/:id       — get payment status (auth required)
router.get("/:id", requireAuth, getPaymentStatus);

// POST /payments/:id/refund — refund a payment (auth required)
router.post("/:id/refund", requireAuth, refundPayment);

module.exports = router;
