const axios = require("axios");
const Show = require("../models/Show");
const { MOVIE_SERVICE_URL } = require("../config/config");

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

    // Validate movie exists
    try {
      const movieResponse = await axios.get(`${MOVIE_SERVICE_URL}/movies/${movieId}`);
      if (!movieResponse.data) {
        return res.status(400).json({ message: "Invalid movie ID — movie not found" });
      }
    } catch {
      return res.status(400).json({ message: "Movie validation failed — movie-service unavailable" });
    }

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
    res.status(400).json({ message: "Failed to create show", error: error.message });
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

// PUT /shows/:showId/seats/reduce
const reduceSeats = async (req, res) => {
  try {
    const seatsToReduce = Number(req.body.seats);
    if (!Number.isInteger(seatsToReduce) || seatsToReduce < 1) {
      return res.status(400).json({ message: "A positive integer seats value is required" });
    }

    const updatedShow = await Show.findOneAndUpdate(
      { _id: req.params.showId, availableSeats: { $gte: seatsToReduce } },
      {
        $inc: {
          availableSeats: -seatsToReduce,
          reservedSeats: seatsToReduce,
        },
      },
      { new: true }
    );

    if (!updatedShow) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    return res.status(200).json(updatedShow);
  } catch (error) {
    return res.status(500).json({ message: "Failed to reduce seats", error: error.message });
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
  reduceSeats,
  deleteShow,
};
