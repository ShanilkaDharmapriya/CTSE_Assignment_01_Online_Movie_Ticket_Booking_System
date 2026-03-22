const axios = require("axios");
const mongoose = require("mongoose");
const Theater = require("../models/Theater");
const { Show } = require("../models/Show");
const { ShowSeat } = require("../models/ShowSeat");
const { MOVIE_SERVICE_URL } = require("../config/config");
const { assertNoTheaterOverlap } = require("../services/showOverlap");
const {
  generateSeatLabelsFromTheater,
  seedSeatsForNewShow,
  getSeatLayoutForShow,
  syncShowAggregates,
} = require("../services/seatService");
const { cancelShowById } = require("../services/showLifecycle");

const buildMovieServiceCandidates = () => {
  const candidates = [MOVIE_SERVICE_URL];
  return [...new Set(candidates.filter(Boolean).map((url) => String(url).replace(/\/+$/, "")))];
};

const validateMovieExists = async (movieId) => {
  const candidates = buildMovieServiceCandidates();
  let sawNotFound = false;

  for (const baseUrl of candidates) {
    try {
      const response = await axios.get(`${baseUrl}/movies/${movieId}`, { timeout: 5000 });
      if (response.data) {
        return true;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        sawNotFound = true;
        continue;
      }
    }
  }

  if (sawNotFound) {
    const err = new Error("Invalid movie ID - movie not found");
    err.statusCode = 400;
    throw err;
  }

  const err = new Error("Movie validation failed - movie-service unavailable");
  err.statusCode = 503;
  throw err;
};

async function attachSeatStatsToShows(showDocs) {
  if (!showDocs.length) return showDocs.map((d) => (d.toObject ? d.toObject() : d));

  const ids = showDocs.map((d) => d._id);
  const stats = await ShowSeat.aggregate([
    { $match: { showId: { $in: ids } } },
    {
      $group: {
        _id: "$showId",
        available: {
          $sum: { $cond: [{ $eq: ["$status", "AVAILABLE"] }, 1, 0] },
        },
        held: { $sum: { $cond: [{ $eq: ["$status", "HELD"] }, 1, 0] } },
        booked: { $sum: { $cond: [{ $eq: ["$status", "BOOKED"] }, 1, 0] } },
      },
    },
  ]).exec();

  const map = new Map(stats.map((s) => [String(s._id), s]));

  return showDocs.map((doc) => {
    const o = doc.toObject ? doc.toObject() : { ...doc };
    const st = map.get(String(o._id));
    if (st) {
      o.availableSeats = st.available;
      o.heldSeats = st.held;
      o.bookedSeats = st.booked;
    }
    return o;
  });
}

/**
 * Public / customer listing: upcoming ACTIVE shows only.
 */
const getAllShows = async (req, res) => {
  try {
    const now = new Date();
    const filter = {
      status: "ACTIVE",
      endTime: { $gt: now },
    };
    if (req.query.movieId) filter.movieId = req.query.movieId;

    const shows = await Show.find(filter)
      .populate("theaterId", "name rows seatsPerRow layoutVersion")
      .sort({ startTime: 1 })
      .exec();

    const withStats = await attachSeatStatsToShows(shows);
    res.status(200).json(withStats);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve shows", error: error.message });
  }
};

/**
 * Admin: all shows (history, reporting, cancelled).
 */
const getAllShowsAdmin = async (req, res) => {
  try {
    const filter = {};
    if (req.query.movieId) filter.movieId = req.query.movieId;
    if (req.query.status) filter.status = req.query.status;

    const shows = await Show.find(filter)
      .populate("theaterId", "name rows seatsPerRow layoutVersion")
      .sort({ startTime: -1 })
      .exec();

    const withStats = await attachSeatStatsToShows(shows);
    res.status(200).json(withStats);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve shows", error: error.message });
  }
};

const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.showId).populate("theaterId", "name rows seatsPerRow layoutVersion").exec();
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }
    const [enriched] = await attachSeatStatsToShows([show]);
    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve show", error: error.message });
  }
};

const getSeatInfo = async (req, res) => {
  try {
    const viewerUserId = req.auth?.user?.id ?? req.auth?.user?._id ?? null;
    const layout = await getSeatLayoutForShow(req.params.showId, viewerUserId);
    res.status(200).json(layout);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Failed to retrieve seat layout" });
  }
};

const createShow = async (req, res) => {
  try {
    const { movieId, theaterId, startTime, endTime } = req.body;

    if (!movieId || !theaterId || !startTime || !endTime) {
      return res.status(400).json({
        message: "movieId, theaterId, startTime, and endTime are required (ISO 8601 dates)",
      });
    }

    await validateMovieExists(movieId);

    if (!mongoose.Types.ObjectId.isValid(theaterId)) {
      return res.status(400).json({ message: "Invalid theaterId" });
    }

    const theater = await Theater.findById(theaterId).exec();
    if (!theater) {
      return res.status(404).json({ message: "Theater not found" });
    }

    await assertNoTheaterOverlap({ theaterId, startTime, endTime });

    const labels = generateSeatLabelsFromTheater(theater.rows, theater.seatsPerRow);

    const show = new Show({
      movieId: String(movieId),
      theaterId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      layoutVersionUsed: theater.layoutVersion,
      status: "ACTIVE",
      availableSeats: 0,
      reservedSeats: 0,
    });

    const savedShow = await show.save();

    try {
      await seedSeatsForNewShow(savedShow._id, labels);
      await syncShowAggregates(savedShow._id);
    } catch (seatErr) {
      await Show.findByIdAndDelete(savedShow._id).exec();
      throw seatErr;
    }

    const refreshed = await Show.findById(savedShow._id).populate("theaterId", "name rows seatsPerRow layoutVersion").exec();
    const [out] = await attachSeatStatsToShows([refreshed]);
    res.status(201).json(out);
  } catch (error) {
    console.error("[ShowService][CreateShow] failed", {
      requestBody: req.body,
      statusCode: error.statusCode,
      message: error.message,
      stack: error.stack,
    });
    res.status(error.statusCode || 400).json({ message: "Failed to create show", error: error.message });
  }
};

const updateShow = async (req, res) => {
  try {
    const forbidden = ["theaterId", "startTime", "endTime", "availableSeats", "reservedSeats", "layoutVersionUsed"];
    for (const k of forbidden) {
      if (req.body[k] !== undefined) {
        return res.status(400).json({
          message: `Cannot change ${k} after creation — cancel the show and create a new one`,
        });
      }
    }

    const updates = {};
    if (req.body.movieId !== undefined) updates.movieId = String(req.body.movieId);

    if (req.body.status !== undefined && req.body.status !== "CANCELLED") {
      return res.status(400).json({
        message: "Only status=CANCELLED is allowed via update for lifecycle changes",
      });
    }

    const cancelRequested = req.body.status === "CANCELLED";

    if (Object.keys(updates).length === 0 && !cancelRequested) {
      return res.status(400).json({ message: "No allowed fields to update" });
    }

    if (cancelRequested) {
      const cancelled = await cancelShowById(req.params.showId);
      if (!cancelled) {
        return res.status(404).json({ message: "Show not found" });
      }
      if (updates.movieId) {
        await validateMovieExists(updates.movieId);
        await Show.findByIdAndUpdate(req.params.showId, { $set: { movieId: updates.movieId } }).exec();
      }
      await syncShowAggregates(req.params.showId);
      const updatedShow = await Show.findById(req.params.showId).populate("theaterId", "name rows seatsPerRow layoutVersion").exec();
      const [out] = await attachSeatStatsToShows([updatedShow]);
      return res.status(200).json(out);
    }

    if (updates.movieId) {
      await validateMovieExists(updates.movieId);
    }

    const updatedShow = await Show.findByIdAndUpdate(req.params.showId, { $set: updates }, { new: true, runValidators: true })
      .populate("theaterId", "name rows seatsPerRow layoutVersion")
      .exec();

    if (!updatedShow) {
      return res.status(404).json({ message: "Show not found" });
    }

    const [out] = await attachSeatStatsToShows([updatedShow]);
    res.status(200).json(out);
  } catch (error) {
    res.status(400).json({ message: "Failed to update show", error: error.message });
  }
};

/**
 * Soft-cancel only (retains show + seats for history).
 */
const deleteShow = async (req, res) => {
  try {
    const showId = req.params.showId;
    if (!mongoose.Types.ObjectId.isValid(showId)) {
      return res.status(400).json({ message: "Invalid show id" });
    }

    const cancelled = await cancelShowById(showId);
    if (!cancelled) {
      return res.status(404).json({ message: "Show not found" });
    }

    await syncShowAggregates(showId);

    res.status(200).json({
      message: "Show cancelled (data retained for history)",
      showId,
      status: "CANCELLED",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel show", error: error.message });
  }
};

module.exports = {
  getAllShows,
  getAllShowsAdmin,
  getShowById,
  getSeatInfo,
  createShow,
  updateShow,
  deleteShow,
};
