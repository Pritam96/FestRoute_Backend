import fs from "fs";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import ErrorResponse from "./errorResponse.js";

dotenv.config({ path: "./config/config.env" });

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    throw new ErrorResponse({
      message: "File path is required",
      statusCode: 400,
    });
  }

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File upload successful", response);

    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    throw new ErrorResponse({
      message: "Failed to upload image to Cloudinary",
      statusCode: 500,
    });
  } finally {
    fs.unlinkSync(localFilePath);
  }
};

export default uploadOnCloudinary;
