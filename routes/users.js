import express from "express";
import { registerUser } from "../controllers/users.js";
import { userValidationSchemas } from "../utils/validationSchemas.js";
import { validationHandler } from "../middleware/validationHandler.js";

const router = express.Router();

router.post(
  "/register",
  userValidationSchemas.register,
  validationHandler,
  registerUser
);

export default router;
