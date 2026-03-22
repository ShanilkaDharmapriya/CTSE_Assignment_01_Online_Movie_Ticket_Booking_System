const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const {
  getAllTheaters,
  getTheaterById,
  createTheater,
  updateTheater,
  deleteTheater,
} = require("../controllers/theaterController");

const router = express.Router();

router.get("/", getAllTheaters);
router.get("/:theaterId", getTheaterById);
router.post("/", requireAuth, requireAdmin, createTheater);
router.put("/:theaterId", requireAuth, requireAdmin, updateTheater);
router.delete("/:theaterId", requireAuth, requireAdmin, deleteTheater);

module.exports = router;
