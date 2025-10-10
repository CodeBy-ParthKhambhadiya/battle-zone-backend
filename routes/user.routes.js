
import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getUserByIdController, resetPasswordController, updateUserController } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me/:id", protect, getUserByIdController);
router.put("/me/:id", protect, updateUserController);
router.put("/reset-password", protect, resetPasswordController);

export default router;
