const express = require("express");
const { requireAdmin } = require("../middleware/authMiddleware");
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
router.post("/", requireAdmin, createTheater);
router.put("/:theaterId", requireAdmin, updateTheater);
router.delete("/:theaterId", requireAdmin, deleteTheater);

module.exports = router;
