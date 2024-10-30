class ErrorResponse extends Error {
  constructor({
    message = "Something went wrong",
    statusCode = 500,
    errors = [],
    data = null,
    stack = "",
    exposeStack = process.env.NODE_ENV === "development",
  } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.message = message;
    this.errors = errors;
    this.data = data;

    // Capture stack trace conditionally
    if (exposeStack && stack) {
      this.stack = stack;
    } else if (exposeStack) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ErrorResponse;
