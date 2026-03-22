const axios = require("axios");
const { SHOW_SERVICE_URL } = require("../config/config");

const holdSeats = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || "";
    const response = await axios.post(
      `${SHOW_SERVICE_URL}/seats/hold`,
      req.body,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const body = error.response?.data || { message: error.message || "Failed to hold seats" };
    return res.status(status).json(body);
  }
};

const releaseSeats = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || "";
    const response = await axios.post(
      `${SHOW_SERVICE_URL}/seats/release`,
      req.body,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const body = error.response?.data || { message: error.message || "Failed to release seats" };
    return res.status(status).json(body);
  }
};

module.exports = { holdSeats, releaseSeats };
