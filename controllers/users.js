import asyncHandler from "express-async-handler";
import User from "../models/user.js";
import ErrorResponse from "../utils/errorResponse.js";
import SuccessResponse from "../utils/successResponse.js";
import uploadOnCloudinary, {
  deleteFromCloudinary,
} from "../utils/cloudinaryService.js";
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
  const user = await User.create(req.body);

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

export const changeCurrentPassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id).select("+password");
  const isPasswordCorrect = await user.matchPassword(oldPassword);

  if (!isPasswordCorrect) {
    return next(
      new ErrorResponse({ message: "Invalid old password", statusCode: 400 })
    );
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new SuccessResponse({
      message: "Password changed successfully",
      data: {},
    })
  );
});

export const getCurrentUser = asyncHandler(async (req, res, next) => {
  return res.status(200).json(
    new SuccessResponse({
      message: "Current user fetched successfully",
      statusCode: 200,
      data: req.user,
    })
  );
});

export const updateAccountDetails = asyncHandler(async (req, res, next) => {
  const { fullName, email } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  );

  return res.status(200).json(
    new SuccessResponse({
      message: "Account details updated successfully",
      statusCode: 200,
      data: user,
    })
  );
});

export const updateUserAvatar = asyncHandler(async (req, res, next) => {
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  if (!avatarLocalPath) {
    return next(
      new ErrorResponse({ message: "Avatar image is missing", statusCode: 400 })
    );
  }

  // Upload new avatar to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    return next(
      new ErrorResponse({
        message: "Error while uploading avatar image",
        statusCode: 500,
      })
    );
  }

  // Find user and store the current avatar URL for deletion
  const user = await User.findById(req.user?._id);
  const oldAvatarUrl = user.avatar;

  // Update user's avatar
  user.avatar = avatar.url;
  await user.save({ validateBeforeSave: false });

  // Delete the old avatar from Cloudinary (if it exists)
  if (oldAvatarUrl) {
    try {
      await deleteFromCloudinary(oldAvatarUrl);
    } catch (error) {
      console.error(
        "Failed to delete old avatar from Cloudinary:",
        error.message
      );
      // Proceed without failing the request for this error
    }
  }

  return res.status(200).json(
    new SuccessResponse({
      message: "Avatar image updated successfully",
      statusCode: 200,
      data: user,
    })
  );
});
