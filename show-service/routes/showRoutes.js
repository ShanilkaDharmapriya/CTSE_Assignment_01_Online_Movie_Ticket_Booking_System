const express = require("express");
const router = express.Router();
const { requireAdmin, requireAdminOrService } = require("../middleware/authMiddleware");
const {
  getAllShows,
  getShowById,
  getSeatInfo,
  createShow,
  updateShow,
  deleteShow,
} = require("../controllers/showController");

// GET  /shows              — get all shows (supports ?movieId=)
router.get("/", getAllShows);

// GET  /shows/:showId      — get a specific show by ID
router.get("/:showId", getShowById);

// GET  /shows/:showId/seats    — get seat info (NEW per spec)
router.get("/:showId/seats", getSeatInfo);

// POST /shows              — create a new show
router.post("/", requireAdmin, createShow);

// PUT  /shows/:showId      — update show details (admin or internal service)
router.put("/:showId", requireAdminOrService, updateShow);

// DELETE /shows/:showId    — delete a show
router.delete("/:showId", requireAdmin, deleteShow);

module.exports = router;
