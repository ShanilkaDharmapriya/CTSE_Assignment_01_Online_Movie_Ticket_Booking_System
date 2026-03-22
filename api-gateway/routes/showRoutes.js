const express = require("express");
const router = express.Router();
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const {
  getAllShows,
  getAllShowsAdmin,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
  getSeatInfo,
} = require("../controllers/showController");

router.get("/admin/list", requireAuth, requireAdmin, getAllShowsAdmin);

router.get("/", getAllShows);

router.post("/", requireAuth, requireAdmin, createShow);

router.get("/:showId/seats", getSeatInfo);

router.get("/:showId", getShowById);

router.put("/:showId", requireAuth, requireAdmin, updateShow);

router.delete("/:showId", requireAuth, requireAdmin, deleteShow);

module.exports = router;
