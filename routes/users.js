import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/users.js";
import { userValidationSchemas } from "../utils/validationSchemas.js";
import { validationHandler } from "../middleware/validationHandler.js";
import { avatarUpload } from "../middleware/multerMiddleware.js";
import ErrorResponse from "../utils/errorResponse.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  avatarUpload, // Handle avatar upload first to populate req.files
  userValidationSchemas.register,
  (req, res, next) => {
    // Check if avatar image file exists in req.files
    if (!req.files?.avatar || req.files.avatar.length === 0) {
      return next(
        new ErrorResponse({
          message: "Avatar image is required",
          statusCode: 400,
        })
      );
    }
    next();
  },
  validationHandler,
  registerUser
);

router.post(
  "/login",
  userValidationSchemas.login,
  validationHandler,
  loginUser
);

router.post("/logout", protect, logoutUser);

export default router;
