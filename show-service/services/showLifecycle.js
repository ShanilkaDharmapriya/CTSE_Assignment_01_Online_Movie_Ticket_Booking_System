const { Show } = require("../models/Show");
const { ShowSeat } = require("../models/ShowSeat");

/**
 * Mark past ACTIVE shows as COMPLETED (retain rows for history/reporting).
 */
async function completePastShows() {
  const now = new Date();
  const res = await Show.updateMany(
    { status: "ACTIVE", endTime: { $lte: now } },
    { $set: { status: "COMPLETED" } }
  ).exec();
  return { modifiedCount: res.modifiedCount };
}

/**
 * Soft-cancel: do not delete show or seats; release HELD only (BOOKED stays for audit).
 */
async function cancelShowById(showId) {
  const show = await Show.findByIdAndUpdate(
    showId,
    { $set: { status: "CANCELLED" } },
    { new: true }
  ).exec();

  if (!show) return null;

  await ShowSeat.updateMany(
    { showId, status: "HELD" },
    { $set: { status: "AVAILABLE", heldBy: null, expiresAt: null } }
  ).exec();

  return show;
}

module.exports = {
  completePastShows,
  cancelShowById,
};
