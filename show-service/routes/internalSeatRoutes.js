const express = require("express");
const { requireServiceKey } = require("../middleware/authMiddleware");
const { verifyHeld, confirmBooked } = require("../controllers/internalSeatController");

const router = express.Router();

router.post("/verify-held", requireServiceKey, verifyHeld);
router.post("/confirm-booked", requireServiceKey, confirmBooked);

module.exports = router;
