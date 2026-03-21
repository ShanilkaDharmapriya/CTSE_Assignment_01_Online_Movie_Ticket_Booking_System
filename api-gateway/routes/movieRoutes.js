const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
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
router.post("/", requireAuth, createMovie);

// PUT  /movies/:id            — update movie
router.put("/:id", requireAuth, updateMovie);

// DELETE /movies/:id          — delete movie
router.delete("/:id", requireAuth, deleteMovie);

module.exports = router;
