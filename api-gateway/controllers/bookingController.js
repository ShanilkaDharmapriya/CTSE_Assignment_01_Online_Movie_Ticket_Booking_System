const axios = require("axios");

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || "http://localhost:4003";

// POST /bookings
const createBooking = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      userId: req.user.userId,
    };
    const response = await axios.post(`${BOOKING_SERVICE_URL}/bookings`, payload);
    res.status(201).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ success: false, message: "Failed to create booking" });
  }
};

// GET /bookings
const getAllBookings = async (req, res) => {
  try {
    const params = { ...req.query };
    if (req.user.role === "CUSTOMER") {
      params.userId = req.user.userId;
    }
    const response = await axios.get(`${BOOKING_SERVICE_URL}/bookings`, { params });
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ success: false, message: "Failed to fetch bookings" });
  }
};

// GET /bookings/:id
const getBookingById = async (req, res) => {
  try {
    const response = await axios.get(`${BOOKING_SERVICE_URL}/bookings/${req.params.id}`);
    if (req.user.role === "CUSTOMER" && response.data.userId !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ success: false, message: "Failed to fetch booking" });
  }
};

// DELETE /bookings/:id  — cancel a booking
const cancelBooking = async (req, res) => {
  try {
    if (req.user.role === "CUSTOMER") {
      const bookingResponse = await axios.get(`${BOOKING_SERVICE_URL}/bookings/${req.params.id}`);
      if (bookingResponse.data.userId !== req.user.userId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }
    const response = await axios.delete(`${BOOKING_SERVICE_URL}/bookings/${req.params.id}`);
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ success: false, message: "Failed to cancel booking" });
  }
};

module.exports = { createBooking, getAllBookings, getBookingById, cancelBooking };
