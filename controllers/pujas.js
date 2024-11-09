import asyncHandler from "express-async-handler";
import Puja from "../models/pujas.js";
import ErrorResponse from "../utils/errorResponse.js";
import SuccessResponse from "../utils/successResponse.js";

// @desc    Get all pujas
// @route   GET /api/v1/pujas
// @access  Public
export const getPujas = asyncHandler(async (req, res) => {
  const pujas = await Puja.find();
  res.status(200).json(
    new SuccessResponse({
      message: "All pujas retrieved successfully",
      data: pujas,
    })
  );
});

// @desc    Get single puja
// @route   GET /api/v1/pujas/:id
// @access  Public
export const getPuja = asyncHandler(async (req, res, next) => {
  const puja = await Puja.findById(req.params.id);
  if (!puja) {
    return next(new ErrorResponse("Puja not found", 404));
  }
  res.status(200).json(
    new SuccessResponse({
      message: "Puja retrieved successfully",
      data: puja,
    })
  );
});

// @desc    Create a new puja
// @route   POST /api/v1/pujas
// @access  Private
export const createPuja = asyncHandler(async (req, res) => {
  const puja = await Puja.create(req.body);
  res.status(201).json(
    new SuccessResponse({
      message: "Puja created successfully",
      data: puja,
    })
  );
});

// @desc    Update puja
// @route   PUT /api/v1/pujas/:id
// @access  Private
export const editPuja = asyncHandler(async (req, res, next) => {
  const puja = await Puja.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!puja) {
    return next(new ErrorResponse("Puja not found", 404));
  }
  res.status(200).json(
    new SuccessResponse({
      message: "Puja updated successfully",
      data: puja,
    })
  );
});

// @desc    Delete puja
// @route   DELETE /api/v1/pujas/:id
// @access  Private
export const deletePuja = asyncHandler(async (req, res, next) => {
  const puja = await Puja.findByIdAndDelete(req.params.id);
  if (!puja) {
    return next(new ErrorResponse("Puja not found", 404));
  }
  res.status(200).json(
    new SuccessResponse({
      message: "Puja deleted successfully",
      data: {},
    })
  );
});
