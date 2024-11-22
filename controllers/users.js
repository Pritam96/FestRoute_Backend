import asyncHandler from "express-async-handler";
import User from "../models/user.js";
import ErrorResponse from "../utils/errorResponse.js";
import SuccessResponse from "../utils/successResponse.js";
import uploadOnCloudinary from "../utils/cloudinaryService.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshTokens = async (user) => {
  try {
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    // Update user with refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ErrorResponse({
      message: "Failed to generate access and refresh tokens",
      statusCode: 500,
    });
  }
};

export const registerUser = asyncHandler(async (req, res, next) => {
  // Ensure avatar file exists
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  if (!avatarLocalPath) {
    return next(
      new ErrorResponse({ message: "Avatar file is required", statusCode: 400 })
    );
  }

  // Upload to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    return next(
      new ErrorResponse({ message: "Failed to upload avatar", statusCode: 500 })
    );
  }

  // Create user with avatar URL
  const user = await User.create({
    ...req.body,
    avatar: avatar.url,
  });

  return res.status(201).json(
    new SuccessResponse({
      message: "User registered successfully",
      statusCode: 201,
      data: user,
    })
  );
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, username, password } = req.body;

  // Find user by email or username
  const user = await User.findOne({ $or: [{ username }, { email }] }).select(
    "+password"
  );

  if (!user) {
    return next(
      new ErrorResponse({ message: "User does not exist", statusCode: 404 })
    );
  }

  // Verify password
  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    return next(
      new ErrorResponse({ message: "Invalid Credentials", statusCode: 401 })
    );
  }

  // Generate tokens
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshTokens(user);

  // Set cookie options
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };

  // Return success response with tokens
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new SuccessResponse({
        message: "User logged in successfully",
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          accessToken,
          refreshToken,
        },
      })
    );
});

export const logoutUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: "" },
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new SuccessResponse({
        message: "User logged out successfully",
        data: {},
      })
    );
});

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      return next(
        new ErrorResponse({ message: "Unauthorized request", statusCode: 401 })
      );
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id).select("+refreshToken");
    if (!user) {
      return next(
        new ErrorResponse({ message: "Invalid refresh token", statusCode: 401 })
      );
    }

    if (incomingRefreshToken !== user.refreshToken) {
      console.error("Stored token:", user.refreshToken);
      console.error("Incoming token:", incomingRefreshToken);
      return next(
        new ErrorResponse({
          message: "Refresh token is expired or used",
          statusCode: 401,
        })
      );
    }

    // Clear old cookies
    res.clearCookie("accessToken").clearCookie("refreshToken");

    // Set cookie options
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    // Generate new tokens
    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshTokens(user);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new SuccessResponse({
          message: "Access token refreshed successfully",
          data: {
            accessToken,
            refreshToken,
          },
        })
      );
  } catch (error) {
    console.error("Error refreshing token:", error.message);
    return next(
      new ErrorResponse({
        message: error?.message || "Invalid refresh token",
        statusCode: 401,
      })
    );
  }
});
