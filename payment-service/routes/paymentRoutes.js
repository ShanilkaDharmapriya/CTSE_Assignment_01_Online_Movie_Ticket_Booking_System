const express = require("express");
const router = express.Router();
const {
  processPayment,
  getAllPayments,
  getPaymentStatus,
  refundPayment,
} = require("../controllers/paymentController");

router.post("/", processPayment);
router.get("/", getAllPayments);
router.get("/:id", getPaymentStatus);
router.post("/:id/refund", refundPayment);

module.exports = router;