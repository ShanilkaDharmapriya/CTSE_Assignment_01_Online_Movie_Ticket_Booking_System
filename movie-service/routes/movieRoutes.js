const express = require("express");
const router = express.Router();
const {
  getAllMovies,
  getMovieById,
  getMovieWithShows,
  createMovie,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");

// GET  /movies                — list all movies (supports ?status=&genre=&language=)
router.get("/", getAllMovies);

// GET  /movies/:id/shows      — movie details + its active shows (aggregator)
router.get("/:id/shows", getMovieWithShows);

// GET  /movies/:id            — single movie
router.get("/:id", getMovieById);

// POST /movies                — create a movie
router.post("/", createMovie);

// PUT  /movies/:id            — update a movie
router.put("/:id", updateMovie);

// DELETE /movies/:id          — delete a movie (cancels active shows)
router.delete("/:id", deleteMovie);

module.exports = router;
