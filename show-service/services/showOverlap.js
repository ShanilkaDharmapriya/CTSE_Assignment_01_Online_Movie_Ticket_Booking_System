const mongoose = require("mongoose");
const { Show } = require("../models/Show");

/**
 * Interval overlap: [startA, endA) vs [startB, endB) — touch at boundary allowed?
 * Cinema: back-to-back allowed if endTime === next startTime. Use strict overlap: start < otherEnd && end > otherStart
 */
function assertValidWindow(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    const err = new Error("Invalid startTime or endTime");
    err.statusCode = 400;
    throw err;
  }
  if (start >= end) {
    const err = new Error("startTime must be before endTime");
    err.statusCode = 400;
    throw err;
  }
  return { start, end };
}

async function findConflictingShow({ theaterId, startTime, endTime, excludeShowId }) {
  const { start, end } = assertValidWindow(startTime, endTime);

  if (!mongoose.Types.ObjectId.isValid(theaterId)) {
    const err = new Error("Invalid theaterId");
    err.statusCode = 400;
    throw err;
  }

  const filter = {
    theaterId,
    status: "ACTIVE",
    startTime: { $lt: end },
    endTime: { $gt: start },
  };

  if (excludeShowId && mongoose.Types.ObjectId.isValid(excludeShowId)) {
    filter._id = { $ne: excludeShowId };
  }

  return Show.findOne(filter).select("_id startTime endTime movieId").lean().exec();
}

async function assertNoTheaterOverlap({ theaterId, startTime, endTime, excludeShowId }) {
  const clash = await findConflictingShow({ theaterId, startTime, endTime, excludeShowId });
  if (clash) {
    const err = new Error(
      "This theater already has an active show that overlaps the requested time window"
    );
    err.statusCode = 409;
    err.code = "THEATER_OVERLAP";
    err.details = { conflictingShowId: String(clash._id) };
    throw err;
  }
}

module.exports = {
  assertValidWindow,
  findConflictingShow,
  assertNoTheaterOverlap,
};
