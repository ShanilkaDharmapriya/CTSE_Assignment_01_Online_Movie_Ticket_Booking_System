const mongoose = require("mongoose");
const { Show } = require("../models/Show");
const { ShowSeat } = require("../models/ShowSeat");

const HOLD_MS = Number(process.env.SEAT_HOLD_DURATION_MS) || 5 * 60 * 1000;

function normalizeSeatNumber(seat) {
  return String(seat || "").trim().toUpperCase();
}

/**
 * Build labels from theater template: rows ["A","B"], seatsPerRow 10 → A1..A10, B1..B10
 */
function generateSeatLabelsFromTheater(rows, seatsPerRow) {
  const labels = [];
  const perRow = Math.max(1, Math.floor(Number(seatsPerRow) || 0));
  const rowList = Array.isArray(rows) ? rows.map((r) => String(r).trim().toUpperCase()) : [];
  for (const row of rowList) {
    if (!row) continue;
    for (let col = 1; col <= perRow; col += 1) {
      labels.push(`${row}${col}`);
    }
  }
  return labels;
}

async function insertShowSeatsBulk(showId, seatNumbers) {
  if (!seatNumbers.length) {
    const err = new Error("No seats generated from theater layout");
    err.statusCode = 400;
    throw err;
  }

  const bulk = seatNumbers.map((seatNumber) => ({
    insertOne: {
      document: {
        showId,
        seatNumber,
        status: "AVAILABLE",
        heldBy: null,
        expiresAt: null,
      },
    },
  }));

  await ShowSeat.bulkWrite(bulk, { ordered: false });
}

/**
 * Create all ShowSeat documents for a new show from a label list.
 */
async function seedSeatsForNewShow(showId, seatLabels) {
  await insertShowSeatsBulk(showId, seatLabels);
}

async function assertShowBookable(show) {
  if (!show) {
    const err = new Error("Show not found");
    err.statusCode = 404;
    throw err;
  }
  if (show.status !== "ACTIVE") {
    const err = new Error(`Show is not bookable (status: ${show.status})`);
    err.statusCode = 409;
    err.code = "SHOW_NOT_ACTIVE";
    throw err;
  }
  if (new Date(show.endTime) <= new Date()) {
    const err = new Error("Show has already ended");
    err.statusCode = 409;
    err.code = "SHOW_ENDED";
    throw err;
  }
}

async function holdSeatsAtomic({ showId, userId, seatNumbers }) {
  if (!mongoose.Types.ObjectId.isValid(showId)) {
    const err = new Error("Invalid showId");
    err.statusCode = 400;
    throw err;
  }

  const normalized = [...new Set(seatNumbers.map(normalizeSeatNumber))].filter(Boolean);
  if (normalized.length === 0) {
    const err = new Error("At least one seat is required");
    err.statusCode = 400;
    throw err;
  }

  const show = await Show.findById(showId).exec();
  await assertShowBookable(show);

  const seatCount = await ShowSeat.countDocuments({ showId }).exec();
  if (seatCount === 0) {
    const err = new Error("Show has no seat inventory");
    err.statusCode = 503;
    throw err;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + HOLD_MS);
  const held = [];

  try {
    for (const seatNumber of normalized) {
      const updated = await ShowSeat.findOneAndUpdate(
        {
          showId,
          seatNumber,
          status: "AVAILABLE",
        },
        {
          $set: {
            status: "HELD",
            heldBy: String(userId),
            expiresAt,
          },
        },
        { new: true }
      ).exec();

      if (!updated) {
        const err = new Error(
          `One or more seats are no longer available (failed on ${seatNumber})`
        );
        err.statusCode = 409;
        err.code = "SEAT_UNAVAILABLE";
        throw err;
      }
      held.push(seatNumber);
    }

    await syncShowAggregates(showId);

    return {
      showId: String(showId),
      seatNumbers: held,
      heldBy: String(userId),
      expiresAt: expiresAt.toISOString(),
      holdDurationMs: HOLD_MS,
    };
  } catch (e) {
    if (held.length > 0) {
      await ShowSeat.updateMany(
        {
          showId,
          seatNumber: { $in: held },
          status: "HELD",
          heldBy: String(userId),
          expiresAt,
        },
        { $set: { status: "AVAILABLE", heldBy: null, expiresAt: null } }
      ).exec();
      await syncShowAggregates(showId);
    }
    throw e;
  }
}

async function releaseHeldSeatsForUser({ showId, userId, seatNumbers }) {
  if (!mongoose.Types.ObjectId.isValid(showId)) {
    const err = new Error("Invalid showId");
    err.statusCode = 400;
    throw err;
  }
  const normalized = [...new Set(seatNumbers.map(normalizeSeatNumber))].filter(Boolean);
  if (normalized.length === 0) return { released: [] };

  const result = await ShowSeat.updateMany(
    {
      showId,
      seatNumber: { $in: normalized },
      status: "HELD",
      heldBy: String(userId),
    },
    { $set: { status: "AVAILABLE", heldBy: null, expiresAt: null } }
  ).exec();

  await syncShowAggregates(showId);
  return { releasedCount: result.modifiedCount, seatNumbers: normalized };
}

async function releaseExpiredHolds() {
  const now = new Date();
  const expiring = await ShowSeat.find({
    status: "HELD",
    expiresAt: { $lt: now },
  })
    .select("showId")
    .lean()
    .exec();

  const showIds = [...new Set(expiring.map((d) => String(d.showId)))];

  const res = await ShowSeat.updateMany(
    {
      status: "HELD",
      expiresAt: { $lt: now },
    },
    { $set: { status: "AVAILABLE", heldBy: null, expiresAt: null } }
  ).exec();

  for (const sid of showIds) {
    await syncShowAggregates(sid);
  }

  return { modifiedCount: res.modifiedCount };
}

async function verifySeatsHeldByUser({ showId, userId, seatNumbers }) {
  const normalized = [...new Set(seatNumbers.map(normalizeSeatNumber))].filter(Boolean);
  if (normalized.length === 0) {
    const err = new Error("seatNumbers required");
    err.statusCode = 400;
    throw err;
  }
  if (!mongoose.Types.ObjectId.isValid(showId)) {
    const err = new Error("Invalid showId");
    err.statusCode = 400;
    throw err;
  }

  const show = await Show.findById(showId).exec();
  await assertShowBookable(show);

  const now = new Date();
  const docs = await ShowSeat.find({
    showId,
    seatNumber: { $in: normalized },
  }).exec();

  if (docs.length !== normalized.length) {
    const err = new Error("One or more seats do not exist for this show");
    err.statusCode = 400;
    throw err;
  }

  for (const doc of docs) {
    if (doc.status !== "HELD") {
      const err = new Error(`Seat ${doc.seatNumber} is not held (status: ${doc.status})`);
      err.statusCode = 409;
      throw err;
    }
    if (String(doc.heldBy) !== String(userId)) {
      const err = new Error(`Seat ${doc.seatNumber} is held by another user`);
      err.statusCode = 403;
      throw err;
    }
    if (!doc.expiresAt || doc.expiresAt <= now) {
      const err = new Error(`Hold expired for seat ${doc.seatNumber}`);
      err.statusCode = 409;
      err.code = "HOLD_EXPIRED";
      throw err;
    }
  }

  return { ok: true, seatNumbers: normalized };
}

async function confirmSeatsBooked({ showId, userId, seatNumbers }) {
  const normalized = [...new Set(seatNumbers.map(normalizeSeatNumber))].filter(Boolean);
  if (!mongoose.Types.ObjectId.isValid(showId)) {
    const err = new Error("Invalid showId");
    err.statusCode = 400;
    throw err;
  }

  const show = await Show.findById(showId).exec();
  if (!show) {
    const err = new Error("Show not found");
    err.statusCode = 404;
    throw err;
  }
  if (show.status !== "ACTIVE") {
    const err = new Error(`Cannot confirm seats for show in status ${show.status}`);
    err.statusCode = 409;
    throw err;
  }

  const now = new Date();
  for (const seatNumber of normalized) {
    const updated = await ShowSeat.findOneAndUpdate(
      {
        showId,
        seatNumber,
        status: "HELD",
        heldBy: String(userId),
        expiresAt: { $gt: now },
      },
      {
        $set: {
          status: "BOOKED",
          heldBy: null,
          expiresAt: null,
        },
      },
      { new: true }
    ).exec();

    if (!updated) {
      const err = new Error(`Could not confirm seat ${seatNumber} — invalid hold or expired`);
      err.statusCode = 409;
      throw err;
    }
  }

  await syncShowAggregates(showId);
  return { ok: true, seatNumbers: normalized };
}

async function syncShowAggregates(showId) {
  const stats = await ShowSeat.aggregate([
    { $match: { showId: new mongoose.Types.ObjectId(showId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]).exec();

  const counts = { AVAILABLE: 0, HELD: 0, BOOKED: 0 };
  for (const row of stats) {
    counts[row._id] = row.count;
  }

  const reserved = counts.HELD + counts.BOOKED;

  await Show.findByIdAndUpdate(showId, {
    $set: {
      availableSeats: counts.AVAILABLE,
      reservedSeats: reserved,
    },
  }).exec();

  return { ...counts, reserved };
}

async function getSeatLayoutForShow(showId) {
  if (!mongoose.Types.ObjectId.isValid(showId)) {
    const err = new Error("Invalid showId");
    err.statusCode = 400;
    throw err;
  }

  const show = await Show.findById(showId).populate("theaterId", "name rows seatsPerRow layoutVersion").exec();
  if (!show) {
    const err = new Error("Show not found");
    err.statusCode = 404;
    throw err;
  }

  const seats = await ShowSeat.find({ showId })
    .sort({ seatNumber: 1 })
    .lean()
    .exec();

  return {
    showId: String(show._id),
    movieId: show.movieId,
    theaterId: show.theaterId?._id ? String(show.theaterId._id) : String(show.theaterId),
    theaterName: show.theaterId?.name || null,
    startTime: show.startTime,
    endTime: show.endTime,
    status: show.status,
    seats: seats.map((s) => ({
      seatNumber: s.seatNumber,
      status: s.status,
      heldBy: s.heldBy || null,
      expiresAt: s.expiresAt ? new Date(s.expiresAt).toISOString() : null,
    })),
  };
}

module.exports = {
  HOLD_MS,
  normalizeSeatNumber,
  generateSeatLabelsFromTheater,
  seedSeatsForNewShow,
  holdSeatsAtomic,
  releaseHeldSeatsForUser,
  releaseExpiredHolds,
  verifySeatsHeldByUser,
  confirmSeatsBooked,
  syncShowAggregates,
  getSeatLayoutForShow,
};
