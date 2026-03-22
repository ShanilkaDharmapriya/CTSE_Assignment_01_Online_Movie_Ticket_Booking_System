const axios = require("axios");
const mongoose = require("mongoose");
const Movie = require("../models/Movie");
const { SHOW_SERVICE_URL } = require("../config/config");

const ensureDbConnected = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      message: "Database is unavailable. Please try again after MongoDB reconnects.",
    });
    return false;
  }
  return true;
};

const parseArrayField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
};

const buildMoviePayload = (req) => {
  const payload = {
    ...req.body,
    genre: parseArrayField(req.body.genre),
    cast: parseArrayField(req.body.cast),
  };

  if (payload.duration !== undefined) payload.duration = Number(payload.duration);
  if (payload.rating !== undefined) payload.rating = Number(payload.rating);
  if (payload.pricePerSeat !== undefined) payload.pricePerSeat = Number(payload.pricePerSeat);

  if (req.file) {
    payload.poster = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
      fileName: req.file.originalname,
    };
  }

  return payload;
};

// GET /movies  — optionally filter by ?status=&genre=&language=
const getAllMovies = async (req, res) => {
  try {
    if (!ensureDbConnected(res)) return;

    const filter = {};
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.language) filter.language = req.query.language;
    if (req.query.genre)    filter.genre    = req.query.genre;

    const movies = await Movie.find(filter).sort({ releaseDate: -1 });
    const safeMovies = movies.map((movie) => {
      const obj = movie.toObject();
      obj.hasPoster = Boolean(obj.poster?.data);
      if (obj.poster) delete obj.poster.data;
      return obj;
    });
    res.status(200).json(safeMovies);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve movies", error: error.message });
  }
};

// GET /movies/:id
const getMovieById = async (req, res) => {
  try {
    if (!ensureDbConnected(res)) return;

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    const safeMovie = movie.toObject();
    safeMovie.hasPoster = Boolean(safeMovie.poster?.data);
    if (safeMovie.poster) delete safeMovie.poster.data;
    res.status(200).json(safeMovie);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve movie", error: error.message });
  }
};

// GET /movies/:id/shows
// Aggregator: fetch this movie's details + all upcoming shows from show-service
const getMovieWithShows = async (req, res) => {
  try {
    if (!ensureDbConnected(res)) return;

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    let shows = [];
    try {
      const showResponse = await axios.get(
        `${SHOW_SERVICE_URL}/shows?movieId=${req.params.id}&status=active`
      );
      shows = showResponse.data;
    } catch {
      // show-service may be temporarily unavailable; return movie info + empty shows
      shows = [];
    }

    res.status(200).json({ movie, shows });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve movie with shows", error: error.message });
  }
};

// POST /movies
const createMovie = async (req, res) => {
  try {
    if (!ensureDbConnected(res)) return;

    const movie = new Movie(buildMoviePayload(req));
    const savedMovie = await movie.save();
    const safeMovie = savedMovie.toObject();
    safeMovie.hasPoster = Boolean(safeMovie.poster?.data);
    if (safeMovie.poster) delete safeMovie.poster.data;
    res.status(201).json(safeMovie);
  } catch (error) {
    res.status(400).json({ message: "Failed to create movie", error: error.message });
  }
};

// PUT /movies/:id
const updateMovie = async (req, res) => {
  try {
    if (!ensureDbConnected(res)) return;

    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: buildMoviePayload(req) },
      { new: true, runValidators: true }
    );
    if (!updatedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    const safeMovie = updatedMovie.toObject();
    safeMovie.hasPoster = Boolean(safeMovie.poster?.data);
    if (safeMovie.poster) delete safeMovie.poster.data;
    res.status(200).json(safeMovie);
  } catch (error) {
    res.status(400).json({ message: "Failed to update movie", error: error.message });
  }
};

// DELETE /movies/:id
// Also notifies show-service to cancel any active shows for this movie
const deleteMovie = async (req, res) => {
  try {
    if (!ensureDbConnected(res)) return;

    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Best-effort: cancel active shows in show-service
    try {
      const showRes = await axios.get(
        `${SHOW_SERVICE_URL}/shows?movieId=${req.params.id}&status=active`
      );
      const activeShows = showRes.data;
      await Promise.all(
        activeShows.map((show) =>
          axios.put(`${SHOW_SERVICE_URL}/shows/${show._id}`, { status: "cancelled" })
        )
      );
    } catch {
      // Non-fatal: log but don't fail the delete
    }

    res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete movie", error: error.message });
  }
};

// GET /movies/:id/poster
const getMoviePoster = async (req, res) => {
  try {
    if (!ensureDbConnected(res)) return;

    const movie = await Movie.findById(req.params.id).select("poster");
    if (!movie || !movie.poster || !movie.poster.data) {
      return res.status(404).json({ message: "Poster not found" });
    }
    res.set("Content-Type", movie.poster.contentType || "application/octet-stream");
    return res.send(movie.poster.data);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve poster", error: error.message });
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  getMovieWithShows,
  createMovie,
  updateMovie,
  deleteMovie,
  getMoviePoster,
};
