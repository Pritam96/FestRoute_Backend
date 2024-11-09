import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import colors from "colors";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import setupRoutes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Config environment variable path
dotenv.config({ path: "./config/config.env" });
const { PORT, MODE, CORS_ORIGIN } = process.env;

// Connect to DB
connectDB();

const app = express();

// CORS configuration
const corsOptions = { origin: CORS_ORIGIN, credentials: true };
app.use(cors(corsOptions));

// Parse JSON and URL-encoded data
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Static folder
app.use(express.static("public"));

// Development logging
if (MODE === "development") {
  app.use(morgan("dev"));
}

// Set up routes
setupRoutes(app);

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

// Start server with error handling
app
  .listen(PORT, () => {
    console.log(
      `Server running in ${MODE} mode on http://localhost:${PORT}`.yellow.bold
    );
  })
  .on("error", (err) => {
    console.error(`Server failed to start: ${err.message}`.red.bold);
    process.exit(1);
  });
