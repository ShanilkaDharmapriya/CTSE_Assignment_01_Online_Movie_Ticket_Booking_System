const express = require("express");
const router = express.Router();
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

// GET  /movies                — list all movies
router.get("/", getAllMovies);

// GET  /movies/:id            — single movie
router.get("/:id", getMovieById);

// POST /movies                — create movie
router.post("/", requireAuth, requireRole("ADMIN"), createMovie);

// PUT  /movies/:id            — update movie
router.put("/:id", requireAuth, requireRole("ADMIN"), updateMovie);

// DELETE /movies/:id          — delete movie
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteMovie);

module.exports = router;
