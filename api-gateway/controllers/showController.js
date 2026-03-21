const axios = require("axios");

const SHOW_SERVICE_URL = process.env.SHOW_SERVICE_URL || "http://show-service:4002";

// GET /shows  (supports ?movieId=&date=&status=)
const getAllShows = async (req, res) => {
  try {
    const response = await axios.get(`${SHOW_SERVICE_URL}/shows`, { params: req.query });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch shows", error: error.message });
  }
};

// GET /shows/:id
const getShowById = async (req, res) => {
  try {
    const response = await axios.get(`${SHOW_SERVICE_URL}/shows/${req.params.id}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch show", error: error.message });
  }
};

// POST /shows
const createShow = async (req, res) => {
  try {
    const response = await axios.post(`${SHOW_SERVICE_URL}/shows`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to create show", error: error.message });
  }
};

// PUT /shows/:id
const updateShow = async (req, res) => {
  try {
    const response = await axios.put(`${SHOW_SERVICE_URL}/shows/${req.params.id}`, req.body);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to update show", error: error.message });
  }
};

// DELETE /shows/:id
const deleteShow = async (req, res) => {
  try {
    const response = await axios.delete(`${SHOW_SERVICE_URL}/shows/${req.params.id}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to delete show", error: error.message });
  }
};

// PUT /shows/:id/seats
const updateSeatAvailability = async (req, res) => {
  try {
    const response = await axios.put(`${SHOW_SERVICE_URL}/shows/${req.params.id}/seats`, req.body);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to update seat availability", error: error.message });
  }
};

module.exports = { getAllShows, getShowById, createShow, updateShow, deleteShow, updateSeatAvailability };
