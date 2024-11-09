import { check, body } from "express-validator";

export const userValidationSchemas = {
  register: [
    // Username: Required and must be at least 3 characters long
    check("username")
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),

    // Full Name: Required and should only contain letters and spaces
    check("fullName")
      .notEmpty()
      .withMessage("Full name is required")
      .isLength({ min: 3 })
      .withMessage("Full name must be at least 3 characters")
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("Full name can only contain letters and spaces"),

    // Avatar: Required and must be a valid URL
    check("avatar")
      .notEmpty()
      .withMessage("Avatar is required")
      .isURL()
      .withMessage("Avatar must be a valid URL"),

    // Additional validation for other fields like email, password, etc.
    check("email")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],

  login: [
    // Email and password validation for login
    check("email")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    check("password").notEmpty().withMessage("Password is required"),
  ],
};
