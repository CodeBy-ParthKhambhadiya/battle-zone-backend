import { forgotPasswordService, loginUserService, registerUserService, resendOTPService, verifyOTPService } from "../services/auth.service.js";
import { generateToken } from "../utils/jwt.js";

export const registerUserController = async (req, res) => {
  try {
    const user = await registerUserService(req.body);
    const { email } = user; 
    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.password;
    // const safeUser = user.toObject ? user.toObject() : { ...user };
    // delete safeUser.password;
    // delete safeUser.otp;
    // delete safeUser.otpExpire;
    // delete safeUser.otpSentAt;

    // 📨 Commented out OTP notification for now
    // try {
    //   await sendOTPEmail(email, user.otp);
    //   console.log(`✅ OTP sent to ${email}`);
    // } catch (err) {
    //   console.error("❌ Error sending OTP email:", err.message);
    // }

    return res.status(200).json({
      success: true,
      error: false,
      // message: `Registration initiated! OTP has been sent to ${email}`,
      message: `Registration successful! Please wait for admin verification before logging in.`,
      data: safeUser,
    });
  } catch (error) {
    console.error("❌ registerUserController error:", error);

    return res.status(400).json({
      success: false,
      error: true,
      message: error.message || "Something went wrong during registration",
    });
  }
};



export const verifyOTPController = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        error: true,
        message: "Email and OTP are required",
        code: "MISSING_FIELDS",
      });
    }


    // 1️⃣ Verify OTP using the service
    const user = await verifyOTPService(email, otp, role);

    // 2️⃣ Prepare user data (exclude sensitive info)
    const { password, __v, otp: _otp, otpExpiresAt, otpSentAt, ...userData } = user.toObject();

    // 3️⃣ Generate JWT token
    userData.token = generateToken(user._id);


    // 4️⃣ Send response
    return res.status(200).json({
      error: false,
      message: "Email verified successfully! Registration complete.",
      data: userData,
    });
  } catch (error) {
    console.error("🚨 verifyOTPController error:", error);

    return res.status(400).json({
      error: true,
      message: error?.message || "OTP verification failed",
      code: error?.code || "OTP_ERROR",
    });
  }
};

export const resendOTPController = async (req, res) => {
  try {
    const { email, role} = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Email is required to resend OTP.",
      });
    }

    // Call service
    const result = await resendOTPService(email, role);

    return res.status(200).json({
      success: true,
      error: false,
      message: result.message || "OTP resent successfully!",
      data: {
        email: result.email,
        role: result.role,
        otpExpiresAt: result.otpExpiresAt, // frontend can use for countdown
      },
    });
  } catch (error) {
    console.error("🚨 ~ resendOTPController error:", error.message);

    return res.status(400).json({
      success: false,
      error: true,
      code: error.code || "UNKNOWN_ERROR",
      message: error.message,
      remaining: error.remaining || null, // seconds left for resend cooldown
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