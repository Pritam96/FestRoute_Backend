import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import colors from "colors";

import { connectDB } from "./config/db.js";

import pujas from "./routes/pujas.js";

dotenv.config({ path: "./config/config.env" });

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Connecting to DB
connectDB();

const app = express();

// express body parser
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MODE = process.env.NODE_ENV || "development";

// Dev logging middleware
if (MODE === "development") {
  app.use(morgan("dev"));
}

// Mount routers
app.use("/api/v1/pujas", pujas);

// Adding middlewares
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () =>
  console.log(
    `Server running in ${MODE} mode on http://localhost:${PORT}`.yellow.bold
  )
);
