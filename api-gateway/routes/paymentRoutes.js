const express = require("express");
const router = express.Router();
const { processPayment, getAllPayments, getPaymentStatus } = require("../controllers/paymentController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

// POST /payments           — process a payment
router.post("/", requireAuth, requireRole("CUSTOMER"), processPayment);

// GET  /payments           — list payments
router.get("/", requireAuth, requireRole("ADMIN"), getAllPayments);

// GET  /payments/:id       — get payment status
router.get("/:id", requireAuth, getPaymentStatus);

module.exports = router;
