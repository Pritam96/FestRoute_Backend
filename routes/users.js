import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
} from "../controllers/users.js";
import { userValidationSchemas } from "../utils/validationSchemas.js";
import { validationHandler } from "../middleware/validationHandler.js";
import { avatarUpload } from "../middleware/multerMiddleware.js";
import ErrorResponse from "../utils/errorResponse.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Middleware to check avatar image
const validateAvatar = (req, res, next) => {
  if (!req.files?.avatar || req.files.avatar.length === 0) {
    return next(
      new ErrorResponse({
        message: "Avatar image is required",
        statusCode: 400,
      })
    );
  }
  next();
};

// Register user
router.post(
  "/register",
  avatarUpload, // Handle avatar upload first
  validateAvatar, // Ensure avatar file exists
  userValidationSchemas.register,
  validationHandler,
  registerUser
);

// Login user
router.post(
  "/login",
  userValidationSchemas.login,
  validationHandler,
  loginUser
);

// Logout user
router.post("/logout", protect, logoutUser);

// Refresh access token
router.post("/refresh-token", refreshAccessToken);

// Change current password
router.post("/change-password", protect, changeCurrentPassword);

// Get current user details
router.get("/current-user", protect, getCurrentUser);

// Update account details
router.patch("/update-account", protect, updateAccountDetails);

// Update user avatar
router.patch(
  "/avatar",
  protect, // Ensure user is authenticated
  avatarUpload, // Handle avatar upload
  validateAvatar, // Ensure avatar file exists
  updateUserAvatar
);

export default router;
