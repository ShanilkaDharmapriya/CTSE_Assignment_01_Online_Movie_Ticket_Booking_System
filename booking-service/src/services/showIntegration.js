const axios = require("axios");
const { SHOW_SERVICE_URL, INTERNAL_SERVICE_KEY } = require("../../config/config");

/**
 * Booking Service is the only orchestrator that finalizes inventory after a confirmed sale.
 * Show Service performs atomic seat updates only.
 */
async function finalizeSeatsBookedOnShowService({ showId, userId, seatNumbers }) {
  const baseUrl = SHOW_SERVICE_URL.replace(/\/+$/, "");

  await axios.post(
    `${baseUrl}/internal/seats/confirm-booked`,
    { userId, showId, seatNumbers },
    {
      headers: {
        "X-Service-Key": INTERNAL_SERVICE_KEY,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );
}

module.exports = { finalizeSeatsBookedOnShowService };
