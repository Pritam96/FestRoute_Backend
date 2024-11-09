import asyncHandler from "express-async-handler";
import User from "../models/user.js";
import ErrorResponse from "../utils/errorResponse.js";
import SuccessResponse from "../utils/successResponse.js";

// @desc    Register User
// @route   POST /api/v1/users/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, avatar, password } = req.body;

  res.status(200).json(
    new SuccessResponse({
      message: "User registered successfully",
      data,
    })
  );
});
