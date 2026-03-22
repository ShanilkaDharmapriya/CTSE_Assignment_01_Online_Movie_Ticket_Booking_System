const axios = require("axios");
const { BOOKING_SERVICE_URL } = require("../config/config");

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

// GET /bookings
const getAllBookings = async (req, res) => {
  try {
    const role = String(req.auth?.user?.role || "").toLowerCase();
    const authHeader = req.headers.authorization || req.headers.Authorization || "";

    const requestParams =
      role === "admin" ? { ...req.query } : {};

    const response = await axios.get(`${BOOKING_SERVICE_URL}/bookings`, {
      params: requestParams,
      headers: { Authorization: authHeader },
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch bookings", error: error.message });
  }
};

// GET /bookings/:id
const getBookingById = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || "";
    const response = await axios.get(`${BOOKING_SERVICE_URL}/bookings/${req.params.id}`, {
      headers: { Authorization: authHeader },
    });
    res.status(200).json(buildBookingResponse(response.data));
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to fetch booking", error: error.message });
  }
};

// DELETE /bookings/:id  — cancel a booking
const cancelBooking = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || "";
    const response = await axios.delete(`${BOOKING_SERVICE_URL}/bookings/${req.params.id}`, {
      headers: { Authorization: authHeader },
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Failed to cancel booking", error: error.message });
  }
};

module.exports = { getAllBookings, getBookingById, cancelBooking };
