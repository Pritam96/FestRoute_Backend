class SuccessResponse {
  constructor({
    message = "Request was successful",
    statusCode = 200,
    data = null,
    metadata = {},
    stack = "",
    exposeStack = process.env.NODE_ENV === "development",
  } = {}) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.metadata = metadata;

    // Optionally add stack trace if in development
    if (exposeStack && stack) {
      this.stack = stack;
    }
  }
}

export default SuccessResponse;
