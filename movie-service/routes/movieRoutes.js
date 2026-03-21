const express = require("express");
const router = express.Router();
const multer = require("multer");
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

// GET  /movies                — list all movies (supports ?status=&genre=&language=)
router.get("/", getAllMovies);

// GET  /movies/:id/shows      — movie details + its active shows (aggregator)
router.get("/:id/shows", getMovieWithShows);

// GET  /movies/:id            — single movie
router.get("/:id", getMovieById);

// GET  /movies/:id/poster     — returns poster image bytes
router.get("/:id/poster", getMoviePoster);

// POST /movies                — create a movie
router.post("/", upload.single("poster"), createMovie);

// PUT  /movies/:id            — update a movie
router.put("/:id", upload.single("poster"), updateMovie);

// DELETE /movies/:id          — delete a movie (cancels active shows)
router.delete("/:id", deleteMovie);

module.exports = router;
