const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/authMiddleware");
const {
  getAllShows,
  getShowById,
  getSeatInfo,
  createShow,
  updateShow,
  deleteShow,
} = require("../controllers/showController");

// GET  /shows              — get all shows (public)
router.get("/", getAllShows);

// GET  /shows/:showId      — get a specific show by ID (public)
router.get("/:showId", getShowById);

// GET  /shows/:showId/seats    — get seat info (public)
router.get("/:showId/seats", getSeatInfo);

// POST /shows              — create a new show (admin only)
router.post("/", requireAdmin, createShow);

// PUT  /shows/:showId      — update show details (admin only)
router.put("/:showId", requireAdmin, updateShow);

// DELETE /shows/:showId    — delete a show (admin only)
router.delete("/:showId", requireAdmin, deleteShow);

module.exports = router;
