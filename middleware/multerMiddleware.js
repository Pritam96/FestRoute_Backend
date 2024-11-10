import multer from "multer";
import ErrorResponse from "../utils/errorResponse.js";

// Set up storage and file filter for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}.${file.mimetype.split("/")[1]}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    const error = new ErrorResponse({
      message: "Only image files are allowed",
      statusCode: 415,
    });
    cb(error, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 }, // Limit file size to 1MB
});

// Export the upload middleware to use in routes
export const avatarUpload = upload.fields([{ name: "avatar", maxCount: 1 }]);
