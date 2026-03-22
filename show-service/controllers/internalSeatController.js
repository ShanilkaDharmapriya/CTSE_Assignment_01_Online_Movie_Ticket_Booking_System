const {
  verifySeatsHeldByUser,
  confirmSeatsBooked,
} = require("../services/seatService");

async function verifyHeld(req, res) {
  try {
    const { userId, showId, seatNumbers } = req.body || {};
    if (!userId || !showId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({
        message: "userId, showId, and non-empty seatNumbers are required",
      });
    }

    await verifySeatsHeldByUser({ showId, userId, seatNumbers });
    return res.status(200).json({ success: true, verified: true });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Verification failed",
      code: error.code,
    });
  }
}

async function confirmBooked(req, res) {
  try {
    const { userId, showId, seatNumbers } = req.body || {};
    if (!userId || !showId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({
        message: "userId, showId, and non-empty seatNumbers are required",
      });
    }

    const result = await confirmSeatsBooked({ showId, userId, seatNumbers });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to confirm seats",
    });
  }
}

module.exports = {
  verifyHeld,
  confirmBooked,
};
