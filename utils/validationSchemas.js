import { check, body } from "express-validator";
import User from "../models/user.js";

export const userValidationSchemas = {
  register: [
    // Username: Required and minimum 3 characters
    check("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long")
      .custom(async (value) => {
        const user = await User.findOne({ username: value });
        if (user) {
          throw new Error("Username already taken");
        }
        return true;
      }),

    // Full Name: Required, minimum 3 characters, only letters and spaces
    check("fullName")
      .trim()
      .notEmpty()
      .withMessage("Full name is required")
      .isLength({ min: 3 })
      .withMessage("Full name must be at least 3 characters")
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("Full name can only contain letters and spaces"),

    // Email: Required, must be valid format, must be unique
    check("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail()
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (user) {
          throw new Error("E-mail already in use");
        }
        return true;
      }),

    // Password: Required, minimum 6 characters
    check("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],

  login: [
    // Email: Required, must be valid format
    check("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),

    // Password: Required
    check("password").notEmpty().withMessage("Password is required"),
  ],
};
