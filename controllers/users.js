import asyncHandler from "express-async-handler";
import User from "../models/user.js";
import ErrorResponse from "../utils/errorResponse.js";
import SuccessResponse from "../utils/successResponse.js";
import uploadOnCloudinary from "../utils/cloudinaryService.js";

export const registerUser = asyncHandler(async (req, res, next) => {
  // Ensure avatar file exists
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  // Upload to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    return next(
      new ErrorResponse({ message: "Failed to upload avatar", statusCode: 500 })
    );
  }

  // Create user with avatar URL from Cloudinary
  const user = await User.create({
    ...req.body,
    avatar: avatar.url,
  });

  // Return success response with user data
  return res.status(201).json(
    new SuccessResponse({
      message: "User registered successfully",
      statusCode: 200,
      data: user,
    })
  );
});
