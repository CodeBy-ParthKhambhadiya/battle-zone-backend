import bcrypt from "bcryptjs";
import User from "../models/user.modle.js";
import { generateStrongPassword } from "../utils/passwordGenerator.js";
import { sendForgotPasswordEmail, sendOTPEmail } from "../utils/emailService.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

const OTP_RESEND_INTERVAL = 2 * 60 * 1000; 

const pendingUsers = new Map();

export const registerUserService = async (userData) => {
  const { email, password, role = "PLAYER", avatarFile } = userData;
  const now = Date.now();

  const existingUser = await User.findOne({ email, role });
  if (existingUser) throw new Error(`A ${role} with this email already exists`);

  const pendingKey = `${email}_${role}`;
  const pending = pendingUsers.get(pendingKey);

  if (pending) {
    if (now - pending.otpSentAt < OTP_RESEND_INTERVAL) {
      throw new Error("OTP already sent. Please wait before requesting again.");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    pending.otp = otp;
    pending.otpExpire = new Date(now + 10 * 60 * 1000); // 10 minutes
    pending.otpSentAt = now;

    await sendOTPEmail(email, otp);
    return { email, role, message: "OTP resent successfully" };
  }

  let avatarUrl = undefined;
  if (avatarFile) {
    avatarUrl = await uploadToCloudinary(avatarFile.path, "users");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = new Date(now + 10 * 60 * 1000); // 10 minutes

  pendingUsers.set(pendingKey, {
    ...userData,
    avatar: avatarUrl,
    password, 
    otp,
    otpExpire,
    otpSentAt: now,
  });

  await sendOTPEmail(email, otp);
  return { email, role, message: "Registration initiated! OTP sent to email" };
};


export const verifyOTPService = async (email, otp) => {
  // Find pending entry by email — include role in the key dynamically
  const pendingEntry = Array.from(pendingUsers.entries()).find(
    ([key, value]) => key.startsWith(`${email}_`)
  );

  if (!pendingEntry) throw new Error("No registration request found");

  const [pendingKey, pending] = pendingEntry;

  if (pending.otp !== otp) throw new Error("Invalid OTP");
  if (pending.otpExpire < Date.now()) throw new Error("OTP expired");

  // ✅ OTP verified, hash password and create user
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

  // Remove from pending map
  pendingUsers.delete(pendingKey);

  return user;
};

export const resendOTPService = async (email) => {
  // Find pending entry by email
  const pendingEntry = Array.from(pendingUsers.entries()).find(
    ([key, value]) => key.startsWith(`${email}_`)
  );

  if (!pendingEntry) throw new Error("No registration found. Please register first.");

  const [pendingKey, pending] = pendingEntry;
  const now = Date.now();

  if (now - pending.otpSentAt < OTP_RESEND_INTERVAL) {
    const remaining = Math.ceil((OTP_RESEND_INTERVAL - (now - pending.otpSentAt)) / 1000);
    throw new Error(`Please wait ${remaining} seconds before requesting OTP again.`);
  }

  // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  pending.otp = otp;
  pending.otpExpire = new Date(now + 10 * 60 * 1000); // 10 min expiry
  pending.otpSentAt = now;

  // Update the map
  pendingUsers.set(pendingKey, pending);

  await sendOTPEmail(pending.email, otp);

  return { message: "OTP resent successfully", email: pending.email, role: pending.role };
};


export const loginUserService = async (email, password, role) => {
  const user = await User.findOne({ email, role });
  if (!user) throw new Error(`No ${role.toLowerCase()} account found for this email`);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Email or password do not match");

  return user;
};

export const forgotPasswordService = async (email, role) => {
  const user = await User.findOne({ email, role });
  if (!user) throw new Error(`No ${role.toLowerCase()} account found for this email`);

  const tempPassword = generateStrongPassword();

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(tempPassword, salt);
  await user.save();

  await sendForgotPasswordEmail(email, tempPassword, role);

  return { email, tempPassword, role };
};