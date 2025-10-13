import cloudinary from '../config/cloudinaryConfig.js';
import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * Upload a file to Cloudinary and optionally delete it locally
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
    if (deleteLocal) {
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Failed to delete local file: ${err.message}`);
      });
    }
    throw new Error(`Cloudinary upload failed: ${err.message}`);
  }
};

const UPLOAD_FOLDER = path.resolve("uploads");

if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
  console.log(`📁 Created upload directory: ${UPLOAD_FOLDER}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_FOLDER),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) cb(null, true);
  else cb(new Error("Only image files are allowed!"));
};

export const upload = multer({ storage, fileFilter });

export const createUpload = (folderName) => {
  const folderPath = path.resolve("uploads", folderName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`📁 Created upload directory: ${folderPath}`);
  }

  const customStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, folderPath),
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  });

  return multer({ storage: customStorage, fileFilter });
};
