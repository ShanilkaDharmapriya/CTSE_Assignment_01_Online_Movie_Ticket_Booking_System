const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/authMiddleware");
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");

// GET  /movies                — list all movies (public)
router.get("/", getAllMovies);

// GET  /movies/:id            — single movie (public)
router.get("/:id", getMovieById);

// POST /movies                — create movie (admin only)
router.post("/", requireAdmin, createMovie);

// PUT  /movies/:id            — update movie (admin only)
router.put("/:id", requireAdmin, updateMovie);

// DELETE /movies/:id          — delete movie (admin only)
router.delete("/:id", requireAdmin, deleteMovie);

module.exports = router;
