const axios = require("axios");

const MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL || "http://localhost:4001";
const SHOW_SERVICE_URL  = process.env.SHOW_SERVICE_URL  || "http://localhost:4002";

// GET /movies
const getAllMovies = async (req, res) => {
  try {
    const response = await axios.get(`${MOVIE_SERVICE_URL}/movies`);
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ success: false, message: "Failed to fetch movies" });
  }
};

// GET /movies/:id
const getMovieById = async (req, res) => {
  try {
    const response = await axios.get(`${MOVIE_SERVICE_URL}/movies/${req.params.id}`);
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ success: false, message: "Failed to fetch movie" });
  }
};

// POST /movies
const createMovie = async (req, res) => {
  try {
    const response = await axios.post(`${MOVIE_SERVICE_URL}/movies`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ success: false, message: "Failed to create movie" });
  }
};

// PUT /movies/:id
const updateMovie = async (req, res) => {
  try {
    const response = await axios.put(`${MOVIE_SERVICE_URL}/movies/${req.params.id}`, req.body);
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ success: false, message: "Failed to update movie" });
  }
};

// DELETE /movies/:id
const deleteMovie = async (req, res) => {
  try {
    const response = await axios.delete(`${MOVIE_SERVICE_URL}/movies/${req.params.id}`);
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ success: false, message: "Failed to delete movie" });
  }
};

module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };
