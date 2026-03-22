const axios = require("axios");
const FormData = require("form-data");

const MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL || "http://movie-service:4001";
const SHOW_SERVICE_URL  = process.env.SHOW_SERVICE_URL  || "http://show-service:4002";

const getAuthHeaders = (req, extraHeaders = {}) => {
  const authorization = req.headers.authorization || req.headers.Authorization;
  return authorization
    ? { Authorization: authorization, ...extraHeaders }
    : { ...extraHeaders };
};

const buildMultipartPayload = (req) => {
  const form = new FormData();

  Object.entries(req.body || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => form.append(key, entry));
      return;
    }
    if (value !== undefined && value !== null) {
      form.append(key, value);
    }
  });

  if (req.file) {
    form.append("poster", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
  }

  return form;
};

// GET /movies
const getAllMovies = async (req, res) => {
  try {
    const response = await axios.get(`${MOVIE_SERVICE_URL}/movies`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch movies", error: error.message });
  }
};

// GET /movies/:id
const getMovieById = async (req, res) => {
  try {
    const response = await axios.get(`${MOVIE_SERVICE_URL}/movies/${req.params.id}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch movie", error: error.message });
  }
};

// POST /movies
const createMovie = async (req, res) => {
  try {
    const form = buildMultipartPayload(req);
    const response = await axios.post(`${MOVIE_SERVICE_URL}/movies`, form, {
      headers: {
        ...form.getHeaders(),
        ...getAuthHeaders(req),
      },
    });
    res.status(201).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to create movie", error: error.message });
  }
};

// PUT /movies/:id
const updateMovie = async (req, res) => {
  try {
    const form = buildMultipartPayload(req);
    const response = await axios.put(`${MOVIE_SERVICE_URL}/movies/${req.params.id}`, form, {
      headers: {
        ...form.getHeaders(),
        ...getAuthHeaders(req),
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to update movie", error: error.message });
  }
};

// DELETE /movies/:id
const deleteMovie = async (req, res) => {
  try {
    const response = await axios.delete(`${MOVIE_SERVICE_URL}/movies/${req.params.id}`, {
      headers: getAuthHeaders(req),
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to delete movie", error: error.message });
  }
};

module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };
