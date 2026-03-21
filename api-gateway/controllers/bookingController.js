const axios = require("axios");

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || "http://localhost:4003";

const authHeaders = (req) => ({
  headers: { Authorization: req.headers.authorization },
});

// POST /bookings
const createBooking = async (req, res) => {
  try {
    const response = await axios.post(`${BOOKING_SERVICE_URL}/bookings`, req.body, authHeaders(req));
    res.status(201).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to create booking", error: error.message });
  }
};

// GET /bookings
const getAllBookings = async (req, res) => {
  try {
    const response = await axios.get(`${BOOKING_SERVICE_URL}/bookings`, {
      params: req.query,
      ...authHeaders(req),
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch bookings", error: error.message });
  }
};

// GET /bookings/:id
const getBookingById = async (req, res) => {
  try {
    const response = await axios.get(`${BOOKING_SERVICE_URL}/bookings/${req.params.id}`, authHeaders(req));
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch booking", error: error.message });
  }
};

// DELETE /bookings/:id  — cancel a booking
const cancelBooking = async (req, res) => {
  try {
    const response = await axios.delete(`${BOOKING_SERVICE_URL}/bookings/${req.params.id}`, {
      data: req.body,
      ...authHeaders(req),
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to cancel booking", error: error.message });
  }
};

module.exports = { createBooking, getAllBookings, getBookingById, cancelBooking };
