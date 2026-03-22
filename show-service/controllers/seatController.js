const { holdSeatsAtomic, releaseHeldSeatsForUser } = require("../services/seatService");

async function holdSeats(req, res) {
  try {
    const userId = req.auth?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { showId, seats } = req.body || {};
    if (!showId || !Array.isArray(seats)) {
      return res.status(400).json({
        message: "showId and seats (array of seat numbers) are required",
      });
    }

    const result = await holdSeatsAtomic({
      showId,
      userId,
      seatNumbers: seats,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to hold seats",
      code: error.code,
    });
  }
}

async function releaseSeats(req, res) {
  try {
    const userId = req.auth?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { showId, seats } = req.body || {};
    if (!showId || !Array.isArray(seats)) {
      return res.status(400).json({
        message: "showId and seats (array) are required",
      });
    }

    const result = await releaseHeldSeatsForUser({
      showId,
      userId,
      seatNumbers: seats,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to release seats",
    });
  }
}

module.exports = {
  holdSeats,
  releaseSeats,
};
