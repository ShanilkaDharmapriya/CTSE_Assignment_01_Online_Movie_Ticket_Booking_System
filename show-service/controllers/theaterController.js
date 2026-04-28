const mongoose = require("mongoose");
const Theater = require("../models/Theater");
const { Show } = require("../models/Show");

const getAllTheaters = async (req, res) => {
  try {
    const theaters = await Theater.find().sort({ name: 1 }).lean().exec();
    res.status(200).json(theaters);
  } catch (error) {
    res.status(500).json({ message: "Failed to list theaters", error: error.message });
  }
};

const getTheaterById = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.theaterId).lean().exec();
    if (!theater) {
      return res.status(404).json({ message: "Theater not found" });
    }
    res.status(200).json(theater);
  } catch (error) {
    res.status(500).json({ message: "Failed to get theater", error: error.message });
  }
};

const createTheater = async (req, res) => {
  try {
    const { name, rows, seatsPerRow } = req.body;
    const rowList = Array.isArray(rows)
      ? rows.map((r) => String(r).trim().toUpperCase()).filter(Boolean)
      : [];

    if (!name || !rowList.length || seatsPerRow == null) {
      return res.status(400).json({
        message: "name, rows (non-empty array), and seatsPerRow are required",
      });
    }

    const theater = await Theater.create({
      name: String(name).trim(),
      rows: rowList,
      seatsPerRow: Math.floor(Number(seatsPerRow)),
      layoutVersion: 1,
    });

    res.status(201).json(theater);
  } catch (error) {
    res.status(400).json({ message: "Failed to create theater", error: error.message });
  }
};

const updateTheater = async (req, res) => {
  try {
    const { name, rows, seatsPerRow } = req.body;
    const existing = await Theater.findById(req.params.theaterId).exec();
    if (!existing) {
      return res.status(404).json({ message: "Theater not found" });
    }

    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (rows !== undefined) {
      const rowList = Array.isArray(rows)
        ? rows.map((r) => String(r).trim().toUpperCase()).filter(Boolean)
        : [];
      if (!rowList.length) {
        return res.status(400).json({ message: "rows must be a non-empty array" });
      }
      updates.rows = rowList;
    }
    if (seatsPerRow !== undefined) {
      updates.seatsPerRow = Math.floor(Number(seatsPerRow));
    }

    const layoutChanged =
      (updates.rows && JSON.stringify(updates.rows) !== JSON.stringify(existing.rows)) ||
      (updates.seatsPerRow !== undefined && updates.seatsPerRow !== existing.seatsPerRow);

    if (layoutChanged) {
      updates.layoutVersion = (existing.layoutVersion || 1) + 1;
    }

    const theater = await Theater.findByIdAndUpdate(req.params.theaterId, { $set: updates }, { new: true, runValidators: true }).exec();

    res.status(200).json(theater);
  } catch (error) {
    res.status(400).json({ message: "Failed to update theater", error: error.message });
  }
};

const deleteTheater = async (req, res) => {
  try {
    const theaterId = req.params.theaterId;
    if (!mongoose.Types.ObjectId.isValid(theaterId)) {
      return res.status(400).json({ message: "Invalid theater id" });
    }

    const inUse = await Show.countDocuments({ theaterId }).exec();
    if (inUse > 0) {
      return res.status(409).json({
        message: "Cannot delete theater: shows still reference this hall",
        showCount: inUse,
      });
    }

    const deleted = await Theater.findByIdAndDelete(theaterId).exec();
    if (!deleted) {
      return res.status(404).json({ message: "Theater not found" });
    }

    res.status(200).json({ message: "Theater deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete theater", error: error.message });
  }
};

module.exports = {
  getAllTheaters,
  getTheaterById,
  createTheater,
  updateTheater,
  deleteTheater,
};
