const axios = require("axios");
const Show = require("../models/Show");
const { MOVIE_SERVICE_URL } = require("../config/config");

// GET /shows  — optionally filter by ?movieId=&date=
const getAllShows = async (req, res) => {
  try {
    const filter = {};
    if (req.query.movieId) filter.movieId = req.query.movieId;
    if (req.query.date) {
      const day = new Date(req.query.date);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      filter.date = { $gte: day, $lt: next };
    }
    if (req.query.status) filter.status = req.query.status;

    const shows = await Show.find(filter).sort({ date: 1, showTime: 1 });
    res.status(200).json(shows);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve shows", error: error.message });
  }
};

// GET /shows/:id
const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }
    res.status(200).json(show);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve show", error: error.message });
  }
};

// POST /shows  — create a new show (validates movie via movie-service)
const createShow = async (req, res) => {
  try {
    const { movieId, theater, date, showTime, totalSeats, pricePerSeat } = req.body;

    // Validate that the referenced movie exists in movie-service
    let movieTitle;
    try {
      const movieResponse = await axios.get(`${MOVIE_SERVICE_URL}/movies/${movieId}`);
      if (!movieResponse.data) {
        return res.status(400).json({ message: "Invalid movie ID — movie not found" });
      }
      movieTitle = movieResponse.data.title;
    } catch {
      return res.status(400).json({ message: "Movie validation failed — movie-service unavailable or movie not found" });
    }

    const show = new Show({
      movieId,
      movieTitle,
      theater,
      date,
      showTime,
      totalSeats,
      availableSeats: totalSeats,
      pricePerSeat,
    });

    const savedShow = await show.save();
    res.status(201).json(savedShow);
  } catch (error) {
    res.status(400).json({ message: "Failed to create show", error: error.message });
  }
};

// PUT /shows/:id  — update show details
const updateShow = async (req, res) => {
  try {
    const updatedShow = await Show.findByIdAndUpdate(
      req.params.id,
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

// DELETE /shows/:id
const deleteShow = async (req, res) => {
  try {
    const deletedShow = await Show.findByIdAndDelete(req.params.id);
    if (!deletedShow) {
      return res.status(404).json({ message: "Show not found" });
    }
    res.status(200).json({ message: "Show deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete show", error: error.message });
  }
};

// PUT /shows/:id/seats  — reduce available seats after a booking
const updateSeatAvailability = async (req, res) => {
  try {
    const { seatsBooked } = req.body;

    if (!seatsBooked || seatsBooked < 1) {
      return res.status(400).json({ message: "seatsBooked must be a positive integer" });
    }

    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    if (show.status !== "active") {
      return res.status(400).json({ message: `Cannot book seats for a ${show.status} show` });
    }

    if (show.availableSeats < seatsBooked) {
      return res.status(400).json({
        message: "Not enough available seats",
        availableSeats: show.availableSeats,
      });
    }

    show.availableSeats -= seatsBooked;
    const updatedShow = await show.save();

    res.status(200).json({
      message: "Seat availability updated",
      showId: updatedShow._id,
      availableSeats: updatedShow.availableSeats,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update seat availability", error: error.message });
  }
};

module.exports = {
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
  updateSeatAvailability,
};
