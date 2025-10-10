import { forgotPasswordService, loginUserService, registerUserService, verifyOTPService } from "../services/auth.service.js";
import { generateToken } from "../utils/jwt.js";

export const registerUserController = async (req, res) => {
  try {
    const { email } = await registerUserService(req.body);

    return res.status(200).json({
      error: false,
      message: `Registration initiated! OTP has been sent to ${email}`,
      data: { email }, // we only return the email for reference
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

    // Call service to verify OTP and create real user
    const user = await verifyOTPService(email, otp);

    // Remove sensitive fields
    const { password, __v, ...userData } = user.toObject();

    // Generate JWT token
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
    // Use the same registerUserService which handles resend logic
    const result = await registerUserService({ email });
    return res.status(200).json({
      error: false,
      message: result.message,
      data: { email: result.email },
    });
  } catch (error) {
    return res.status(400).json({ error: true, message: error.message });
  }
};

export const loginUserController = async (req, res) => {
   try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "Please provide both email and password",
      });
    }

    // Call the service
    const user = await loginUserService(email, password);

    // Remove sensitive info
    const { password: pwd, __v, ...userData } = user.toObject();

    // Add JWT token
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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: true, message: "Email is required" });
    }

    await forgotPasswordService(email);

    return res.status(200).json({
      error: false,
      message: `A temporary password has been sent to ${email}. Please check your inbox.`,
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return res.status(500).json({ error: true, message: error.message });
  }
};