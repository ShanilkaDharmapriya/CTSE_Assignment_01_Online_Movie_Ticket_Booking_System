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

// POST /shows/:showId/reserve-seats — called by Booking Service (hold seats before payment)
const reserveSeats = async (req, res) => {
  try {
    const seats = Number(req.body.seats);
    if (!Number.isInteger(seats) || seats < 1) {
      return res.status(400).json({ message: "Positive integer seats is required" });
    }

    const updated = await Show.findOneAndUpdate(
      { _id: req.params.showId, availableSeats: { $gte: seats } },
      { $inc: { availableSeats: -seats, reservedSeats: seats } },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    res.status(200).json({
      showId: updated._id,
      availableSeats: updated.availableSeats,
      reservedSeats: updated.reservedSeats,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to reserve seats", error: error.message });
  }
};

// POST /shows/:showId/free-seats — release seats (cancel / payment failure)
const freeSeats = async (req, res) => {
  try {
    const seats = Number(req.body.seats);
    if (!Number.isInteger(seats) || seats < 1) {
      return res.status(400).json({ message: "Positive integer seats is required" });
    }

    const updated = await Show.findOneAndUpdate(
      { _id: req.params.showId, reservedSeats: { $gte: seats } },
      { $inc: { availableSeats: seats, reservedSeats: -seats } },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({ message: "Cannot free seats" });
    }

    res.status(200).json({
      showId: updated._id,
      availableSeats: updated.availableSeats,
      reservedSeats: updated.reservedSeats,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to free seats", error: error.message });
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
  reserveSeats,
  freeSeats,
  createShow,
  updateShow,
  deleteShow,
};
