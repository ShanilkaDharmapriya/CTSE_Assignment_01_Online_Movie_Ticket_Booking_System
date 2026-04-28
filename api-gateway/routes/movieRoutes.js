const express = require("express");
const router = express.Router();
const multer = require("multer");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const {
  getAllMovies,
  getMovieById,
  getMoviePoster,
  createMovie,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");

const upload = multer({ storage: multer.memoryStorage() });
const movieUpload = upload.fields([
  { name: "poster", maxCount: 1 },
  { name: "image", maxCount: 1 },
  { name: "posterFile", maxCount: 1 },
]);

// GET  /movies                — list all movies
router.get("/", getAllMovies);

// GET  /movies/:id/poster      — movie poster image
router.get("/:id/poster", getMoviePoster);

// GET  /movies/:id            — single movie
router.get("/:id", getMovieById);

// POST /movies                — create movie
router.post("/", requireAuth, requireAdmin, movieUpload, createMovie);

// PUT  /movies/:id            — update movie
router.put("/:id", requireAuth, requireAdmin, movieUpload, updateMovie);

// DELETE /movies/:id          — delete movie
router.delete("/:id", requireAuth, requireAdmin, deleteMovie);

module.exports = router;
