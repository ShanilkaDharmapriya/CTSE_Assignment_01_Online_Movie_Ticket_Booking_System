const axios = require("axios");

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || "http://booking-service:4003";

const buildBookingResponse = (payload) => {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  if (payload.bookingReference || !payload.bookingId) {
    return payload;
  }

  return {
    ...payload,
    bookingReference: payload.bookingId,
  };
};

// POST /bookings
const createBooking = async (req, res) => {
  try {
    const bookingPayload = {
      ...req.body,
      userId: req.body.userId || req.auth?.user?.id,
    };

    if (!bookingPayload.userId) {
      return res.status(401).json({ message: "Authenticated user ID is required" });
    }

    const response = await axios.post(`${BOOKING_SERVICE_URL}/bookings`, bookingPayload);
    res.status(201).json(buildBookingResponse(response.data));
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to create booking", error: error.message });
  }
};

// PATCH /bookings/:id/status
const updateBookingStatus = async (req, res) => {
  try {
    const response = await axios.patch(`${BOOKING_SERVICE_URL}/bookings/${req.params.id}/status`, req.body);
    res.status(200).json(buildBookingResponse(response.data));
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to update booking status", error: error.message });
  }
};

// GET /bookings
const getAllBookings = async (req, res) => {
  try {
    const response = await axios.get(`${BOOKING_SERVICE_URL}/bookings`, { params: req.query });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch bookings", error: error.message });
  }
};

// GET /bookings/:id
const getBookingById = async (req, res) => {
  try {
    const response = await axios.get(`${BOOKING_SERVICE_URL}/bookings/${req.params.id}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch booking", error: error.message });
  }
};

// DELETE /bookings/:id  — cancel a booking
const cancelBooking = async (req, res) => {
  try {
    const response = await axios.delete(`${BOOKING_SERVICE_URL}/bookings/${req.params.id}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to cancel booking", error: error.message });
  }
};

module.exports = { createBooking, updateBookingStatus, getAllBookings, getBookingById, cancelBooking };
