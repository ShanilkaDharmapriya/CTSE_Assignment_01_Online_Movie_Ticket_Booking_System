const { v4: uuidv4 } = require("uuid");
const Booking = require("../models/Booking");
const { getMovieById, getShowById } = require("./externalServices");
const { finalizeSeatsBookedOnShowService } = require("./showIntegration");

function normalizeSeatList(seats) {
  if (!Array.isArray(seats)) return [];
  return [...new Set(seats.map((s) => String(s).trim().toUpperCase()).filter(Boolean))];
}

function validateConfirmedBookingPayload(payload) {
  const { userId, movieId, showId, seats, bookingId, status, paymentId } = payload || {};

  const seatList = normalizeSeatList(seats);
  if (!userId || !movieId || !showId || seatList.length === 0) {
    const validationError = new Error(
      "Invalid input: userId, movieId, showId, non-empty seats array, and paymentId are required"
    );
    validationError.statusCode = 400;
    throw validationError;
  }

  if (!paymentId) {
    const err = new Error("paymentId is required for confirmed bookings");
    err.statusCode = 400;
    throw err;
  }

  const normalizedStatus = String(status || "").toUpperCase();
  if (normalizedStatus !== "CONFIRMED") {
    const err = new Error("Bookings can only be created as CONFIRMED after successful payment");
    err.statusCode = 400;
    throw err;
  }

  return {
    userId: String(userId),
    movieId: String(movieId),
    showId: String(showId),
    seats: seatList,
    bookingId: bookingId ? String(bookingId) : null,
    status: normalizedStatus,
    paymentId: String(paymentId),
  };
}

function extractSnapshot(movie, show) {
  const movieTitle = movie?.title ? String(movie.title) : "";
  let theaterName = "";
  if (show?.theaterId && typeof show.theaterId === "object" && show.theaterId.name) {
    theaterName = String(show.theaterId.name);
  }
  const showStartTime = show?.startTime ? new Date(show.startTime) : null;
  return { movieTitle, theaterName, showStartTime };
}

/**
 * Source of truth: creates booking then instructs Show Service to mark seats BOOKED + bookedBy.
 * Idempotent on bookingId for payment retries.
 */
async function createBooking(payload) {
  const validated = validateConfirmedBookingPayload(payload);
  const bookingId = validated.bookingId || uuidv4();

  const existing = await Booking.findOne({ bookingId }).lean().exec();
  if (existing && existing.status === "CONFIRMED") {
    const samePayload =
      String(existing.showId) === String(validated.showId) &&
      String(existing.userId) === String(validated.userId) &&
      JSON.stringify([...existing.seats].map(String).sort()) ===
        JSON.stringify([...validated.seats].sort());
    if (!samePayload) {
      const conflict = new Error("bookingId already exists with different booking details");
      conflict.statusCode = 409;
      throw conflict;
    }
    await finalizeSeatsBookedOnShowService({
      showId: validated.showId,
      userId: validated.userId,
      seatNumbers: validated.seats,
    });
    return { ...existing, bookingReference: existing.bookingId };
  }

  const movie = await getMovieById(validated.movieId).catch(() => {
    const e = new Error("Movie not found");
    e.statusCode = 400;
    throw e;
  });

  const show = await getShowById(validated.showId).catch(() => {
    const e = new Error("Show not found");
    e.statusCode = 400;
    throw e;
  });
  const { movieTitle, theaterName, showStartTime } = extractSnapshot(movie, show);

  let doc;
  try {
    doc = await Booking.create({
      bookingReference: bookingId,
      bookingId,
      userId: validated.userId,
      movieId: validated.movieId,
      showId: validated.showId,
      seats: validated.seats,
      paymentId: validated.paymentId,
      status: "CONFIRMED",
      movieTitle,
      theaterName,
      showStartTime,
      paymentStatus: payload?.paymentStatus ? String(payload.paymentStatus).toUpperCase() : "SUCCESS",
      amount: payload?.amount !== undefined ? Number(payload.amount) : undefined,
      currency: payload?.currency ? String(payload.currency).toLowerCase() : undefined,
      provider: payload?.provider,
      paymentMethod: payload?.paymentMethod,
    });
  } catch (err) {
    if (err.code === 11000) {
      const again = await Booking.findOne({ bookingId }).lean().exec();
      if (again) return { ...again, bookingReference: again.bookingId };
    }
    throw err;
  }

  try {
    await finalizeSeatsBookedOnShowService({
      showId: validated.showId,
      userId: validated.userId,
      seatNumbers: validated.seats,
    });
  } catch (finalizeErr) {
    await Booking.deleteOne({ _id: doc._id }).exec();
    throw finalizeErr;
  }

  const out = doc.toObject();
  out.bookingReference = out.bookingId;
  return out;
}

async function listBookingsForPrincipal({ role, jwtUserId, queryUserId }) {
  const isAdmin = String(role || "").toLowerCase() === "admin";

  if (!isAdmin) {
    return Booking.find({ userId: String(jwtUserId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  const filter = {};
  if (queryUserId !== undefined && queryUserId !== null && String(queryUserId).trim() !== "") {
    filter.userId = String(queryUserId).trim();
  }

  return Booking.find(filter).sort({ createdAt: -1 }).lean().exec();
}

async function getBookingByBookingId(bookingId) {
  return Booking.findOne({ bookingId: String(bookingId) }).lean().exec();
}

async function cancelBooking(bookingId) {
  const updated = await Booking.findOneAndUpdate(
    { bookingId: String(bookingId), status: { $ne: "CANCELLED" } },
    { $set: { status: "CANCELLED" } },
    { new: true }
  )
    .lean()
    .exec();

  if (!updated) {
    const exists = await Booking.findOne({ bookingId: String(bookingId) }).lean().exec();
    if (!exists) {
      const notFoundError = new Error("Booking not found");
      notFoundError.statusCode = 404;
      throw notFoundError;
    }
    const alreadyCancelledError = new Error("Booking is already cancelled");
    alreadyCancelledError.statusCode = 400;
    throw alreadyCancelledError;
  }

  return updated;
}

async function updateBookingStatus(bookingId, payload) {
  const existing = await Booking.findOne({ bookingId: String(bookingId) }).exec();
  if (!existing) {
    const notFoundError = new Error("Booking not found");
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  const nextStatus = String(payload?.status || "").toUpperCase();
  const allowedStatuses = ["PENDING_PAYMENT", "CONFIRMED", "PAYMENT_FAILED", "CANCELLED"];

  if (!allowedStatuses.includes(nextStatus)) {
    const validationError = new Error("Invalid status value");
    validationError.statusCode = 400;
    throw validationError;
  }

  existing.status = nextStatus;
  if (payload.paymentId) existing.paymentId = payload.paymentId;
  if (payload.paymentStatus) existing.paymentStatus = String(payload.paymentStatus).toUpperCase();
  if (payload.failureReason) existing.failureReason = payload.failureReason;
  if (payload.amount !== undefined) existing.amount = Number(payload.amount);
  if (payload.currency) existing.currency = String(payload.currency).toLowerCase();
  if (payload.provider) existing.provider = payload.provider;
  if (payload.paymentMethod) existing.paymentMethod = payload.paymentMethod;

  await existing.save();
  const out = existing.toObject();
  out.bookingReference = out.bookingId;
  return out;
}

module.exports = {
  createBooking,
  listBookingsForPrincipal,
  getBookingByBookingId,
  cancelBooking,
  updateBookingStatus,
};
