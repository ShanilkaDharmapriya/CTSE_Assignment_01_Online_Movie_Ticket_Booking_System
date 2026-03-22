const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { holdSeats, releaseSeats } = require("../controllers/seatController");

const router = express.Router();

router.post("/hold", requireAuth, holdSeats);
router.post("/release", requireAuth, releaseSeats);

module.exports = router;
