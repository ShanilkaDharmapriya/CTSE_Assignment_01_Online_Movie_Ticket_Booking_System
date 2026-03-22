const axios = require("axios");

const SHOW_SERVICE_URL = process.env.SHOW_SERVICE_URL || "http://show-service:4002";

const getAuthHeaders = (req) => {
  const authorization = req.headers.authorization || req.headers.Authorization;
  return authorization ? { Authorization: authorization } : {};
};

// GET /shows  (supports ?movieId=&date=&status=)
const getAllShows = async (req, res) => {
  try {
    const response = await axios.get(`${SHOW_SERVICE_URL}/shows`, { params: req.query });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch shows", error: error.message });
  }
};

const buildProxyErrorPayload = (fallbackMessage, error) => {
  const upstream = error.response?.data;
  if (upstream && typeof upstream === "object") {
    return {
      ...upstream,
      message: upstream.message || fallbackMessage,
    };
  }

  return {
    message: fallbackMessage,
    error: error.message,
  };
};

// GET /shows/:id
const getShowById = async (req, res) => {
  try {
    const response = await axios.get(`${SHOW_SERVICE_URL}/shows/${req.params.showId}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch show", error: error.message });
  }
};

// POST /shows
const createShow = async (req, res) => {
  try {
    const response = await axios.post(`${SHOW_SERVICE_URL}/shows`, req.body, {
      headers: getAuthHeaders(req),
    });
    res.status(201).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json(buildProxyErrorPayload("Failed to create show", error));
  }
};

// PUT /shows/:id
const updateShow = async (req, res) => {
  try {
    const response = await axios.put(`${SHOW_SERVICE_URL}/shows/${req.params.showId}`, req.body, {
      headers: getAuthHeaders(req),
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to update show", error: error.message });
  }
};

// DELETE /shows/:showId
const deleteShow = async (req, res) => {
  try {
    const response = await axios.delete(`${SHOW_SERVICE_URL}/shows/${req.params.showId}`, {
      headers: getAuthHeaders(req),
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to delete show", error: error.message });
  }
};

// GET /shows/:showId/seats
const getSeatInfo = async (req, res) => {
  try {
    const response = await axios.get(`${SHOW_SERVICE_URL}/shows/${req.params.showId}/seats`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch seat info", error: error.message });
  }
};

module.exports = { getAllShows, getShowById, createShow, updateShow, deleteShow, getSeatInfo };
