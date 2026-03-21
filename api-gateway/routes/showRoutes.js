const express = require("express");
const router = express.Router();
const {
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  getSeatInfo,
} = require("../controllers/showController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

// GET  /shows                  — list all shows (supports ?movieId=)
router.get("/", getAllShows);

// GET  /shows/:showId          — single show
router.get("/:showId", getShowById);

// POST /shows                  — create show
router.post("/", requireAuth, requireRole("ADMIN"), createShow);

// PUT  /shows/:showId          — update show
router.put("/:showId", requireAuth, requireRole("ADMIN"), updateShow);

// GET  /shows/:showId/seats    — get seat info
router.get("/:showId/seats", getSeatInfo);

module.exports = router;
