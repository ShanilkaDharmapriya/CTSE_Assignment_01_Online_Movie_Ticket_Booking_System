const express = require("express");
const { requireServiceKey } = require("../middleware/authMiddleware");
const { Show } = require("../models/Show");

const router = express.Router();

/**
 * For movie-service cleanup: list ACTIVE shows (optionally by movieId).
 */
router.get("/list", requireServiceKey, async (req, res) => {
  try {
    const filter = { status: "ACTIVE" };
    if (req.query.movieId) filter.movieId = String(req.query.movieId);
    const shows = await Show.find(filter).select("_id movieId theaterId startTime endTime").lean().exec();
    res.status(200).json(shows);
  } catch (error) {
    res.status(500).json({ message: "Failed to list shows", error: error.message });
  }
});

module.exports = router;
