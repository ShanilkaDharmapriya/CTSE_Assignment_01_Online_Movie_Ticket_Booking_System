const express = require("express");
const router = express.Router();
const { requireAdmin, requireAdminOrService, optionalAuth } = require("../middleware/authMiddleware");
const {
  getAllShows,
  getAllShowsAdmin,
  getShowById,
  getSeatInfo,
  createShow,
  updateShow,
  deleteShow,
} = require("../controllers/showController");

router.get("/admin/list", requireAdmin, getAllShowsAdmin);

router.get("/", getAllShows);

router.post("/", requireAdmin, createShow);

router.get("/:showId/seats", optionalAuth, getSeatInfo);

router.get("/:showId", getShowById);

router.put("/:showId", requireAdminOrService, updateShow);

router.delete("/:showId", requireAdmin, deleteShow);

module.exports = router;
