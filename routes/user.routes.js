
import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { deleteUserController, fetchAdminDetails, getUnverifiedUsersController, getUserByIdController, resetPasswordController, updateUserController, verifyUserController } from "../controllers/user.controller.js";
import { upload } from "../utils/cloudinaryUpload.js"; // Multer setup

const router = express.Router();

router.get("/me", protect, getUserByIdController);
router.put("/me/:id", protect, upload.single("avatarFile"), updateUserController);
router.put("/reset-password", protect, resetPasswordController);

router.get("/unverified", protect, getUnverifiedUsersController);
router.put("/:id/verify", protect, verifyUserController);
router.delete("/:id", protect, deleteUserController);

router.get("/admin/details", fetchAdminDetails);


export default router;
