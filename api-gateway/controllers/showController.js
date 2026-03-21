const axios = require("axios");

const SHOW_SERVICE_URL = process.env.SHOW_SERVICE_URL || "http://localhost:4002";

const authHeaders = (req) => ({
  headers: { Authorization: req.headers.authorization },
});

// GET /shows  (supports ?movieId=&date=&status=)
const getAllShows = async (req, res) => {
  try {
    const response = await axios.get(`${SHOW_SERVICE_URL}/shows`, {
      params: req.query,
      ...authHeaders(req),
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch shows", error: error.message });
  }
};

// GET /shows/:showId
const getShowById = async (req, res) => {
  try {
    const response = await axios.get(`${SHOW_SERVICE_URL}/shows/${req.params.showId}`, authHeaders(req));
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch show", error: error.message });
  }
};

// POST /shows
const createShow = async (req, res) => {
  try {
    const response = await axios.post(`${SHOW_SERVICE_URL}/shows`, req.body, authHeaders(req));
    res.status(201).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to create show", error: error.message });
  }
};

// PUT /shows/:showId
const updateShow = async (req, res) => {
  try {
    const response = await axios.put(`${SHOW_SERVICE_URL}/shows/${req.params.showId}`, req.body, authHeaders(req));
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to update show", error: error.message });
  }
};

// GET /shows/:showId/seats
const getSeatInfo = async (req, res) => {
  try {
    const response = await axios.get(`${SHOW_SERVICE_URL}/shows/${req.params.showId}/seats`, authHeaders(req));
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch seat info", error: error.message });
  }
};

// DELETE /shows/:showId
const deleteShow = async (req, res) => {
  try {
    const response = await axios.delete(`${SHOW_SERVICE_URL}/shows/${req.params.showId}`, authHeaders(req));
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to delete show", error: error.message });
  }
};

module.exports = { getAllShows, getShowById, createShow, updateShow, getSeatInfo, deleteShow };
