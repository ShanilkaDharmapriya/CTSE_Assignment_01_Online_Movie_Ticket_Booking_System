const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const {
  processPayment,
  getAllPayments,
  getPaymentStatus,
  refundPayment,
} = require("../controllers/paymentController");

router.post("/", requireAuth, processPayment);
router.get("/", requireAuth, getAllPayments);
router.get("/:id", requireAuth, getPaymentStatus);
router.post("/:id/refund", requireAuth, refundPayment);

module.exports = router;