const express = require("express");
const router = express.Router();
const multer = require("multer");
const { requireAdmin } = require("../middleware/authMiddleware");
const {
  getAllMovies,
  getMovieById,
  getMovieWithShows,
  createMovie,
  updateMovie,
  deleteMovie,
  getMoviePoster,
} = require("../controllers/movieController");

const upload = multer({ storage: multer.memoryStorage() });

// GET  /movies                — list all movies (public)
router.get("/", getAllMovies);

// GET  /movies/:id/shows      — movie details + its active shows (aggregator, public)
router.get("/:id/shows", getMovieWithShows);

// GET  /movies/:id            — single movie (public)
router.get("/:id", getMovieById);

// GET  /movies/:id/poster     — returns poster image bytes (public)
router.get("/:id/poster", getMoviePoster);

// POST /movies                — create a movie (admin only)
router.post("/", requireAdmin, upload.single("poster"), createMovie);

// PUT  /movies/:id            — update a movie (admin only)
router.put("/:id", requireAdmin, upload.single("poster"), updateMovie);

// DELETE /movies/:id          — delete a movie (admin only)
router.delete("/:id", requireAdmin, deleteMovie);

module.exports = router;
