const express = require("express");
const router = express.Router();
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");

// GET  /movies                — list all movies
router.get("/", getAllMovies);

// GET  /movies/:id            — single movie
router.get("/:id", getMovieById);

// POST /movies                — create movie
router.post("/", createMovie);

// PUT  /movies/:id            — update movie
router.put("/:id", updateMovie);

// DELETE /movies/:id          — delete movie
router.delete("/:id", deleteMovie);

module.exports = router;
