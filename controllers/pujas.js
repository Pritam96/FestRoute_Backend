import asyncHandler from "express-async-handler";
import Puja from "../models/pujas.js";

// @desc    Get all pujas
// @route   GET /api/v1/pujas
// @access  Public
export const getPujas = asyncHandler(async (req, res) => {
  // Fetch all pujas from the database
  const pujas = await Puja.find();
  res.status(200).json({ success: true, data: pujas });
});

// @desc    Get single puja
// @route   GET /api/v1/pujas/:id
// @access  Public
export const getPuja = asyncHandler(async (req, res) => {
  const puja = await Puja.findById(req.params.id);
  if (!puja) {
    res.status(404);
    throw new Error("Puja not found");
  }
  res.status(200).json({ success: true, data: puja });
});

// @desc    Create a new puja
// @route   POST /api/v1/pujas
// @access  Private
export const createPuja = asyncHandler(async (req, res) => {
  const puja = await Puja.create(req.body);
  res.status(201).json({ success: true, data: puja });
});

// @desc    Update puja
// @route   PUT /api/v1/pujas/:id
// @access  Private
export const editPuja = asyncHandler(async (req, res) => {
  const puja = await Puja.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!puja) {
    res.status(404);
    throw new Error("Puja not found");
  }
  res.status(200).json({ success: true, data: puja });
});

// @desc    Delete puja
// @route   DELETE /api/v1/pujas/:id
// @access  Private
export const deletePuja = asyncHandler(async (req, res) => {
  const puja = await Puja.findByIdAndDelete(req.params.id);
  if (!puja) {
    res.status(404);
    throw new Error("Puja not found");
  }
  res.status(200).json({ success: true, data: {} });
});
