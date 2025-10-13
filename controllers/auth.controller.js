import { forgotPasswordService, loginUserService, registerUserService, resendOTPService, verifyOTPService } from "../services/auth.service.js";
import { generateToken } from "../utils/jwt.js";

export const registerUserController = async (req, res) => {
  try {
    const { email } = await registerUserService(req.body);

    return res.status(200).json({
      error: false,
      message: `Registration initiated! OTP has been sent to ${email}`,
      data: { email }, 
    });
  } catch (error) {
    return res.status(400).json({
      error: true,
      message: error.message,
    });
  }
};

export const verifyOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await verifyOTPService(email, otp);

    const { password, __v, ...userData } = user.toObject();

    userData.token = generateToken(user._id);

    return res.status(200).json({
      error: false,
      message: "Email verified successfully! Registration complete.",
      data: userData,
    });
  } catch (error) {
    return res.status(400).json({
      error: true,
      message: error.message,
    });
  }
};

export const resendOTPController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new Error("Email is required to resend OTP");
    }

    const result = await resendOTPService(email);

    return res.status(200).json({
      error: false,
      message: result.message,
      data: { email },
    });
  } catch (error) {
    return res.status(400).json({
      error: true,
      message: error.message,
    });
  }
};

export const loginUserController = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        error: true,
        message: "Please provide email, password, and role",
      });
    }

    const user = await loginUserService(email, password, role);

    const { password: pwd, __v, ...userData } = user.toObject();

    userData.token = generateToken(user._id);

    return res.status(200).json({
      error: false,
      message: "Logged in successfully!",
      data: userData,
    });
  } catch (error) {
    return res.status(400).json({
      error: true,
      message: error.message,
    });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        error: true,
        message: "Email and role are required",
      });
    }

    await forgotPasswordService(email, role);

    return res.status(200).json({
      error: false,
      message: `A temporary password has been sent to ${email}. Please check your inbox.`,
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return res.status(500).json({ error: true, message: error.message });
  }
};