const express = require("express");
const router = express.Router();
const multer = require("multer");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");

const upload = multer({ storage: multer.memoryStorage() });

// GET  /movies                — list all movies
router.get("/", getAllMovies);

// GET  /movies/:id            — single movie
router.get("/:id", getMovieById);

// POST /movies                — create movie
router.post("/", requireAuth, requireAdmin, upload.single("poster"), createMovie);

// PUT  /movies/:id            — update movie
router.put("/:id", requireAuth, requireAdmin, upload.single("poster"), updateMovie);

// DELETE /movies/:id          — delete movie
router.delete("/:id", requireAuth, requireAdmin, deleteMovie);

module.exports = router;
