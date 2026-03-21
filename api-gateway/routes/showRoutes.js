const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const {
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  getSeatInfo,
} = require("../controllers/showController");

// GET  /shows                  — list all shows (supports ?movieId=)
router.get("/", getAllShows);

// GET  /shows/:showId          — single show
router.get("/:showId", getShowById);

// POST /shows                  — create show
router.post("/", requireAuth, createShow);

// PUT  /shows/:showId          — update show
router.put("/:showId", requireAuth, updateShow);

// GET  /shows/:showId/seats    — get seat info
router.get("/:showId/seats", getSeatInfo);

module.exports = router;
