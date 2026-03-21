const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/authMiddleware");
const {
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  getSeatInfo,
  deleteShow,
} = require("../controllers/showController");

// GET  /shows                  — list all shows (public)
router.get("/", getAllShows);

// GET  /shows/:showId/seats    — get seat info (public) — before /:showId
router.get("/:showId/seats", getSeatInfo);

// GET  /shows/:showId          — single show (public)
router.get("/:showId", getShowById);

// POST /shows                  — create show (admin only)
router.post("/", requireAdmin, createShow);

// PUT  /shows/:showId          — update show (admin only)
router.put("/:showId", requireAdmin, updateShow);

// DELETE /shows/:showId        — delete show (admin only)
router.delete("/:showId", requireAdmin, deleteShow);

module.exports = router;
