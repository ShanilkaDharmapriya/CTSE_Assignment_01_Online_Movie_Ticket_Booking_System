const axios = require("axios");
const Movie = require("../models/Movie");
const { SHOW_SERVICE_URL } = require("../config/config");

// GET /movies  — optionally filter by ?status=&genre=&language=
const getAllMovies = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.language) filter.language = req.query.language;
    if (req.query.genre)    filter.genre    = req.query.genre;

    const movies = await Movie.find(filter).sort({ releaseDate: -1 });
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve movies", error: error.message });
  }
};

// GET /movies/:id
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve movie", error: error.message });
  }
};

// GET /movies/:id/shows
// Aggregator: fetch this movie's details + all upcoming shows from show-service
const getMovieWithShows = async (req, res) => {
  try {
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
    const movie = new Movie(req.body);
    const savedMovie = await movie.save();
    res.status(201).json(savedMovie);
  } catch (error) {
    res.status(400).json({ message: "Failed to create movie", error: error.message });
  }
};

// PUT /movies/:id
const updateMovie = async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json(updatedMovie);
  } catch (error) {
    res.status(400).json({ message: "Failed to update movie", error: error.message });
  }
};

// DELETE /movies/:id
// Also notifies show-service to cancel any active shows for this movie
const deleteMovie = async (req, res) => {
  try {
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

module.exports = {
  getAllMovies,
  getMovieById,
  getMovieWithShows,
  createMovie,
  updateMovie,
  deleteMovie,
};
