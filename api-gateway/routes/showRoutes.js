const express = require("express");
const router = express.Router();
const {
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
  updateSeatAvailability,
} = require("../controllers/showController");

// GET  /shows              — list all shows (supports ?movieId=&date=&status=)
router.get("/", getAllShows);

// GET  /shows/:id          — single show
router.get("/:id", getShowById);

// POST /shows              — create show
router.post("/", createShow);

// PUT  /shows/:id          — update show
router.put("/:id", updateShow);

// DELETE /shows/:id        — delete show
router.delete("/:id", deleteShow);

// PUT  /shows/:id/seats    — update seat availability
router.put("/:id/seats", updateSeatAvailability);

module.exports = router;
