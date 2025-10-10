import cloudinary from '../config/cloudinaryConfig.js';
import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * @param {string} filePath - Local path of the file
 * @param {string} folder - Cloudinary folder name
 * @param {boolean} deleteLocal - Delete local file after upload (default: true)
 * @returns {Promise<string>} - Returns Cloudinary secure URL
 */
export const uploadToCloudinary = async (filePath, folder = 'users', deleteLocal = true) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder });

    if (deleteLocal) {
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Failed to delete local file: ${err.message}`);
      });
    }

    return result.secure_url;
  } catch (err) {
    // Delete local file even if upload fails
    if (deleteLocal) {
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Failed to delete local file: ${err.message}`);
      });
    }
    throw new Error(`Cloudinary upload failed: ${err.message}`);
  }
};


const defaultUploadDir = path.resolve("src", "uploads");

// Ensure folder exists
if (!fs.existsSync(defaultUploadDir)) {
  fs.mkdirSync(defaultUploadDir, { recursive: true });
  console.log(`📁 Created upload directory: ${defaultUploadDir}`);
}

// Configure storage
const defaultStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, defaultUploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Optional file filter (images only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) cb(null, true);
  else cb(new Error("Only image files are allowed!"));
};

// Export default upload middleware
export const upload = multer({
  storage: defaultStorage,
  fileFilter,
});

// ----------------------------
// Factory function to create upload middleware for custom folders
// ----------------------------
export const createUpload = (folderName) => {
  const uploadDir = path.resolve("src", "uploads", folderName);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 Created upload directory: ${uploadDir}`);
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  });

  return multer({ storage, fileFilter });
};
