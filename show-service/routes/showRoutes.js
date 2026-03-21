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

// GET  /shows              — get all shows (supports ?movieId=&date=&status=)
router.get("/", getAllShows);

// GET  /shows/:id          — get a specific show by ID
router.get("/:id", getShowById);

// POST /shows              — create a new show
router.post("/", createShow);

// PUT  /shows/:id          — update show details
router.put("/:id", updateShow);

// DELETE /shows/:id        — delete a show
router.delete("/:id", deleteShow);

// PUT  /shows/:id/seats    — update seat availability (called by booking-service)
router.put("/:id/seats", updateSeatAvailability);

module.exports = router;
