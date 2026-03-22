const axios = require("axios");

const DEFAULT_INTERNAL_KEY = "ctse-internal-service-key-2026";

/**
 * Booking Service is the only orchestrator that finalizes inventory after a confirmed sale.
 * Show Service performs atomic seat updates only.
 */
async function finalizeSeatsBookedOnShowService({ showId, userId, seatNumbers }) {
  const baseUrl = (process.env.SHOW_SERVICE_URL || "http://localhost:4002").replace(/\/+$/, "");
  const key = process.env.INTERNAL_SERVICE_KEY || DEFAULT_INTERNAL_KEY;

  await axios.post(
    `${baseUrl}/internal/seats/confirm-booked`,
    { userId, showId, seatNumbers },
    {
      headers: {
        "X-Service-Key": key,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );
}

module.exports = { finalizeSeatsBookedOnShowService };
