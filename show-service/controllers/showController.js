const axios = require("axios");
const Show = require("../models/Show");
const { MOVIE_SERVICE_URL } = require("../config/config");

const buildMovieServiceCandidates = () => {
  const candidates = [MOVIE_SERVICE_URL, "http://localhost:4001", "http://movie-service:4001"];
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

// GET /shows
const getAllShows = async (req, res) => {
  try {
    const filter = {};
    if (req.query.movieId) filter.movieId = req.query.movieId;

    const shows = await Show.find(filter).sort({ createdAt: -1 });
    res.status(200).json(shows);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve shows", error: error.message });
  }
};

// GET /shows/:showId
const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.showId);
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }
    res.status(200).json(show);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve show", error: error.message });
  }
};

// GET /shows/:showId/seats
const getSeatInfo = async (req, res) => {
  try {
    const show = await Show.findById(req.params.showId);
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }
    res.status(200).json({
      showId: show._id,
      movieId: show.movieId,
      availableSeats: show.availableSeats,
      reservedSeats: show.reservedSeats,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve seat info", error: error.message });
  }
};

// POST /shows
const createShow = async (req, res) => {
  try {
    const { movieId, theater, date, showTime, availableSeats } = req.body;

    // Validate movie against both local and docker hostnames.
    await validateMovieExists(movieId);

    const show = new Show({
      movieId,
      theater,
      date,
      showTime,
      availableSeats,
      reservedSeats: 0,
    });

    const savedShow = await show.save();
    res.status(201).json(savedShow);
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: "Failed to create show", error: error.message });
  }
};

// PUT /shows/:showId
const updateShow = async (req, res) => {
  try {
    const updatedShow = await Show.findByIdAndUpdate(
      req.params.showId,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedShow) {
      return res.status(404).json({ message: "Show not found" });
    }
    res.status(200).json(updatedShow);
  } catch (error) {
    res.status(400).json({ message: "Failed to update show", error: error.message });
  }
};

// DELETE /shows/:showId
const deleteShow = async (req, res) => {
  try {
    const deletedShow = await Show.findByIdAndDelete(req.params.showId);
    if (!deletedShow) {
      return res.status(404).json({ message: "Show not found" });
    }
    res.status(200).json({ message: "Show deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete show", error: error.message });
  }
};

module.exports = {
  getAllShows,
  getShowById,
  getSeatInfo,
  createShow,
  updateShow,
  deleteShow,
};
