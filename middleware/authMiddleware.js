import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import ErrorResponse from "../utils/errorResponse.js";

export const protect = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next(
        new ErrorResponse({ message: "Unauthorized request", statusCode: 401 })
      );
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      return next(
        new ErrorResponse({ message: "Invalid access token", statusCode: 401 })
      );
    }

    req.user = user;

    next();
  } catch (error) {
    return next(
      new ErrorResponse({
        message: error?.message || "Invalid access token",
        statusCode: 401,
      })
    );
  }
});
