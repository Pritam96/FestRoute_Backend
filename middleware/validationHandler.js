import { validationResult } from "express-validator";
import ErrorResponse from "../utils/errorResponse.js";

export const validationHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    const formattedErrors = errors.array().map(({ path, msg }) => ({
      field: path,
      message: msg,
    }));

    return next(
      new ErrorResponse({
        message: "Validation failed",
        statusCode: 400,
        errors: formattedErrors,
      })
    );
  }
  next();
};
