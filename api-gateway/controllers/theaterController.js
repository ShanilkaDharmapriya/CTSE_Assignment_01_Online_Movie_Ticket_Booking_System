const axios = require("axios");

const SHOW_SERVICE_URL = process.env.SHOW_SERVICE_URL || "http://show-service:4002";

const getAuthHeaders = (req) => {
  const authorization = req.headers.authorization || req.headers.Authorization;
  return authorization ? { Authorization: authorization } : {};
};

const getAllTheaters = async (req, res) => {
  try {
    const response = await axios.get(`${SHOW_SERVICE_URL}/theaters`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch theaters", error: error.message });
  }
};

const getTheaterById = async (req, res) => {
  try {
    const response = await axios.get(`${SHOW_SERVICE_URL}/theaters/${req.params.theaterId}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch theater", error: error.message });
  }
};

const createTheater = async (req, res) => {
  try {
    const response = await axios.post(`${SHOW_SERVICE_URL}/theaters`, req.body, {
      headers: getAuthHeaders(req),
    });
    res.status(201).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Failed to create theater",
      error: error.message,
    });
  }
};

const updateTheater = async (req, res) => {
  try {
    const response = await axios.put(`${SHOW_SERVICE_URL}/theaters/${req.params.theaterId}`, req.body, {
      headers: getAuthHeaders(req),
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Failed to update theater",
      error: error.message,
    });
  }
};

const deleteTheater = async (req, res) => {
  try {
    const response = await axios.delete(`${SHOW_SERVICE_URL}/theaters/${req.params.theaterId}`, {
      headers: getAuthHeaders(req),
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Failed to delete theater",
      error: error.message,
    });
  }
};

module.exports = {
  getAllTheaters,
  getTheaterById,
  createTheater,
  updateTheater,
  deleteTheater,
};
