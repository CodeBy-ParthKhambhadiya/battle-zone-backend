
import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getUserByIdController, resetPasswordController, updateUserController } from "../controllers/user.controller.js";
import { upload } from "../utils/cloudinaryUpload.js"; // Multer setup

const router = express.Router();

router.get("/me", protect, getUserByIdController);
router.put("/me/:id", protect, upload.single("avatarFile"), updateUserController);
router.put("/reset-password", protect, resetPasswordController);

export default router;
