import fs from "fs";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import ErrorResponse from "./errorResponse.js";

dotenv.config({ path: "./config/config.env" });

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

    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    throw new ErrorResponse({
      message: "Failed to upload image to Cloudinary",
      statusCode: 500,
    });
  } finally {
    fs.unlink(localFilePath, (err) => {
      if (err) console.error("Error deleting local file:", err);
    });
  }
};

export const deleteFromCloudinary = async (cloudinaryFileLink) => {
  if (!cloudinaryFileLink) {
    throw new ErrorResponse({
      message: "Previous file link is missing",
      statusCode: 400,
    });
  }

  try {
    // Extract the public ID and folder from the Cloudinary file URL
    const urlParts = cloudinaryFileLink.split("/");
    const publicId = urlParts[urlParts.length - 1].split(".")[0]; // Extract file name without extension

    // const folder = urlParts[urlParts.length - 2]; // Assumes folder is the penultimate segment
    // const publicIdWithFolder = `${folder}/${publicId}`; // Combine folder with file name
    
    // const response = await cloudinary.uploader.destroy(publicIdWithFolder);

    const response = await cloudinary.uploader.destroy(publicId);

    if (response.result !== "ok" && response.result !== "not found") {
      throw new Error("Failed to delete the file from Cloudinary");
    }

    console.log("File deletion successful:", response);

    return response;
  } catch (error) {
    console.error("Cloudinary deletion error:", error);

    throw new ErrorResponse({
      message: "Failed to delete previous image from Cloudinary",
      statusCode: 500,
    });
  }
};

export default uploadOnCloudinary;
