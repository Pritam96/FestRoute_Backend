import dotenv from "dotenv";
import express from "express";

dotenv.config({ path: "./config/config.env" });

const app = express();

const PORT = process.env.PORT || 5000;
const MODE = process.env.NODE_ENV || production;

app.get("/", (req, res, next) => res.send("Hi"));

app.listen(
  PORT,
  console.log(`Server running in ${MODE} mode on http://localhost:${PORT}`)
);
