const axios = require("axios");

const SHOW_SERVICE_URL = process.env.SHOW_SERVICE_URL || "http://localhost:4002";

// GET /shows  (supports ?movieId=&date=&status=)
const getAllShows = async (req, res) => {
  try {
    const response = await axios.get(`${SHOW_SERVICE_URL}/shows`, { params: req.query });
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ success: false, message: "Failed to fetch shows" });
  }
};

// GET /shows/:id
const getShowById = async (req, res) => {
  try {
    const showId = req.params.showId || req.params.id;
    const response = await axios.get(`${SHOW_SERVICE_URL}/shows/${showId}`);
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ success: false, message: "Failed to fetch show" });
  }
};

// POST /shows
const createShow = async (req, res) => {
  try {
    const response = await axios.post(`${SHOW_SERVICE_URL}/shows`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ success: false, message: "Failed to create show" });
  }
};

// PUT /shows/:id
const updateShow = async (req, res) => {
  try {
    const showId = req.params.showId || req.params.id;
    const response = await axios.put(`${SHOW_SERVICE_URL}/shows/${showId}`, req.body);
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ success: false, message: "Failed to update show" });
  }
};

// GET /shows/:showId/seats
const getSeatInfo = async (req, res) => {
  try {
    const response = await axios.get(`${SHOW_SERVICE_URL}/shows/${req.params.showId}/seats`);
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ success: false, message: "Failed to fetch seat info" });
  }
};

module.exports = { getAllShows, getShowById, createShow, updateShow, getSeatInfo };
