import express from "express";
import {  forgotPasswordController, loginUserController, registerUserController, resendOTPController, verifyOTPController } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.post("/forgot-password", forgotPasswordController);
router.post("/verify-otp", verifyOTPController);
router.post("/resend-otp", resendOTPController);
export default router;