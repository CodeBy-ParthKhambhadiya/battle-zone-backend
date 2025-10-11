import bcrypt from "bcryptjs";
import User from "../models/user.modle.js";
import { generateStrongPassword } from "../utils/passwordGenerator.js";
import { sendForgotPasswordEmail, sendOTPEmail } from "../utils/emailService.js";

  const OTP_RESEND_INTERVAL = 2 * 60 * 1000; // 2 minutes in ms

// Temporary in-memory store (you can replace with a PendingUser collection)
const pendingUsers = new Map();

export const registerUserService = async (userData) => {
  const { email, password } = userData;

  // Check if user already exists in main DB
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists");

  // Check pendingUsers for resend
  const pending = pendingUsers.get(email);
  const now = Date.now();
  if (pending) {
    if (now - pending.otpSentAt < OTP_RESEND_INTERVAL) {
      throw new Error("OTP already sent. Please wait before requesting again.");
    }

    // Resend OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    pending.otp = otp;
    pending.otpExpire = new Date(now + 2 * 60 * 1000); // 10 minutes
    pending.otpSentAt = now;

    await sendOTPEmail(email, otp);
    return { email, message: "OTP resent successfully" };
  }

  // New pending user - generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = new Date(now + 2 * 60 * 1000);

  pendingUsers.set(email, {
    ...userData,
    password, // store plain password temporarily (will hash after OTP verification)
    otp,
    otpExpire,
    otpSentAt: now,
  });

  await sendOTPEmail(email, otp);
  return { email, message: "Registration initiated! OTP sent to email" };
};

export const verifyOTPService = async (email, otp) => {
  const pending = pendingUsers.get(email);
  if (!pending) throw new Error("No registration request found");

  if (pending.otp !== otp) throw new Error("Invalid OTP");
  if (pending.otpExpire < Date.now()) throw new Error("OTP expired");

  // ✅ OTP verified, create real user in DB
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(pending.password, salt);

  const user = await User.create({
    ...pending,
    password: hashedPassword,
    isVerified: true,
    emailOTP: undefined,
    otpExpire: undefined,
    otpSentAt: undefined,
  });

  // Remove pending user
  pendingUsers.delete(email);

  return user;
};
export const resendOTPService = async (email) => {

  const pending = pendingUsers.get(email);
  const now = Date.now();

  if (!pending) {
    throw new Error("No registration found for this email. Please register first.");
  }

  if (now - pending.otpSentAt < OTP_RESEND_INTERVAL) {
    const remaining = Math.ceil((OTP_RESEND_INTERVAL - (now - pending.otpSentAt)) / 1000);
    throw new Error(`Please wait ${remaining} seconds before requesting OTP again.`);
  }

  // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  pending.otp = otp;
  pending.otpExpire = new Date(now + 2 * 60 * 1000); // 10 min expiry
  pending.otpSentAt = now;

  // Update the map
  pendingUsers.set(email, pending);

  await sendOTPEmail(email, otp);

  return { message: "OTP resent successfully" };
};

export const loginUserService = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Email or password do not match");
  }
  return user;
};

export const forgotPasswordService = async (email) => {
  // 1️⃣ Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  // 2️⃣ Generate a strong temporary password
  const tempPassword = generateStrongPassword();

  // 3️⃣ Hash the new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(tempPassword, salt);

  // 4️⃣ Save user with updated password
  await user.save();

  // 5️⃣ Send the temporary password via email
  await sendForgotPasswordEmail(email, tempPassword);

  // 6️⃣ Return success info
  return { email, tempPassword };
};
