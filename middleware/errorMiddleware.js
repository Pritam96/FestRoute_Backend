import ErrorResponse from "../utils/errorResponse.js";

export const notFound = (req, res, next) => {
  next(
    new ErrorResponse({
      message: `Not Found - ${req.originalUrl}`,
      statusCode: 404,
    })
  );
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected error occurred";
  let errors = err.errors || [];

  // Handle specific error types
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Log error details in development mode
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  // Return the error response
  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
