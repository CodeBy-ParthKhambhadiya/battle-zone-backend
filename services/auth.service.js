import bcrypt from "bcryptjs";
import User from "../models/user.modle.js";
import { generateStrongPassword } from "../utils/passwordGenerator.js";
import { sendForgotPasswordEmail, sendOTPEmail } from "../utils/emailService.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

const OTP_RESEND_INTERVAL = 2 * 60 * 1000;
const OTP_EXPIRE_DURATION = 2 * 60 * 1000;

export const registerUserService = async (userData) => {
  console.log("🚀 ~ registerUserService ~ userData:", userData);
  const { email, password, role = "PLAYER", avatarFile, ...rest } = userData;

  const now = new Date(); // Date object

  const existingUser = await User.findOne({ email, role });

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new Error(`A ${role} with this email already exists`);
    }

    // OTP resend restriction
    if (existingUser.otpSentAt && now - existingUser.otpSentAt < OTP_RESEND_INTERVAL) {
      throw new Error("OTP already sent. Please wait before requesting again.");
    }

    // Regenerate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    existingUser.otp = otp;
    existingUser.otpExpire = new Date(now.getTime() + OTP_EXPIRE_DURATION);
    existingUser.otpSentAt = now;

    await existingUser.save();
    await sendOTPEmail(email, otp);

    return existingUser; // Return updated user object
  }

  // 2️⃣ Hash the password before creating a new user
  const hashedPassword = await bcrypt.hash(password, 10); // 10 rounds of salt

  // 3️⃣ Create new user
  let avatarUrl;
  if (avatarFile) {
    avatarUrl = await uploadToCloudinary(avatarFile.path, "users");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const newUser = await User.create({
    email,
    password: hashedPassword, // ✅ store hashed password
    role,
    avatar: avatarUrl,
    otp,
    otpExpire: new Date(now.getTime() + OTP_EXPIRE_DURATION),
    otpSentAt: now,
    isVerified: false,
    ...rest,
  });

  console.log("🚀 ~ registerUserService ~ newUser:", newUser);

  await sendOTPEmail(email, otp);

  return newUser; // Return newly created user
};

export const verifyOTPService = async (email, otp, role = "PLAYER") => {
  const user = await User.findOne({ email, role });

  if (!user) throw Object.assign(new Error("No registration request found"), { code: "NO_REGISTRATION" });
  if (user.isVerified) throw Object.assign(new Error("Account is already verified"), { code: "ALREADY_VERIFIED" });
  if (user.otp !== otp) throw Object.assign(new Error("Invalid OTP"), { code: "INVALID_OTP" });
  if (user.otpExpire < Date.now()) throw Object.assign(new Error("OTP expired"), { code: "OTP_EXPIRED" });

  // Mark user as verified
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpire = undefined;
  user.otpSentAt = undefined;

  await user.save();
  return user;
};
export const resendOTPService = async (email, role = "PLAYER") => {
  const user = await User.findOne({ email, role });
  console.log("🚀 ~ resendOTPService ~ user:", user)

  if (!user) {
    throw Object.assign(new Error("No registration found"), { code: "NO_REGISTRATION" });
  }

  if (user.isVerified) {
    throw Object.assign(new Error("Account is already verified"), { code: "ALREADY_VERIFIED" });
  }

  const now = new Date();

  // Safely get last OTP sent timestamp
  const lastSent = user.otpSentAt ? new Date(user.otpSentAt).getTime() : 0;

  // Check resend cooldown
  if (lastSent && now.getTime() - lastSent < OTP_RESEND_INTERVAL) {
    const remaining = Math.ceil((OTP_RESEND_INTERVAL - (now.getTime() - lastSent)) / 1000);
    throw Object.assign(
      new Error(`Please wait ${remaining} seconds before requesting OTP again.`),
      { code: "OTP_RESEND_WAIT", remaining }
    );
  }

  // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // ✅ Set OTP and timers
  user.otp = otp;
  user.otpSentAt = now; // store as Date
  user.otpExpire = new Date(now.getTime() + OTP_EXPIRE_DURATION);

  await user.save();

  // Send OTP
  await sendOTPEmail(email, otp);

  return {
    success: true,
    message: "OTP resent successfully!",
    email: user.email,
    role: user.role,
    otpExpiresAt: user.otpExpire,           // frontend countdown
    otpResendAvailableAt: new Date(now.getTime() + OTP_RESEND_INTERVAL), // resend timer
  };
};

export const loginUserService = async (email, password, role) => {
  console.log("🚀 ~ loginUserService ~ password:", password)
  const user = await User.findOne({ email, role });
  if (!user) throw new Error(`No ${role.toLowerCase()} account found for this email`);

  const isMatch = await bcrypt.compare(password, user.password);
  console.log("🚀 ~ loginUserService ~ isMatch:", isMatch)
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