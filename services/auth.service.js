import bcrypt from "bcryptjs";
import User from "../models/user.modle.js";
import { generateStrongPassword } from "../utils/passwordGenerator.js";
import { sendForgotPasswordEmail, sendOTPEmail } from "../utils/emailService.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { manageUserNotification } from "../utils/notificationManager.js";

const OTP_RESEND_INTERVAL = 2 * 60 * 1000;
const OTP_EXPIRE_DURATION = 2 * 60 * 1000;

export const registerUserService = async (userData) => {
  const { email, password, role = "PLAYER", avatarFile, ...rest } = userData;

  const now = new Date();

  const existingUser = await User.findOne({ email, role });

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new Error(`A ${role} with this email already exists`);
    }

    // 🔒 Commented out OTP resend interval logic
    // if (existingUser.otpSentAt && now - existingUser.otpSentAt < OTP_RESEND_INTERVAL) {
    //   throw new Error("OTP already sent. Please wait before requesting again.");
    // }

    // ⚙️ Skipping OTP regeneration
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // existingUser.otp = otp;
    // existingUser.otpExpire = new Date(now.getTime() + OTP_EXPIRE_DURATION);
    // existingUser.otpSentAt = now;

    await existingUser.save();

    // 📨 Skipped sending OTP
    // await sendOTPEmail(email, otp);

    return existingUser;
  }

  // 2️⃣ Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3️⃣ Handle avatar upload if provided
  let avatarUrl;
  if (avatarFile) {
    avatarUrl = await uploadToCloudinary(avatarFile.path, "users");
  }

  // ⚙️ Skipping OTP generation
  // const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const isVerified = role === "ORGANIZER" ? false : true;

  const newUser = await User.create({
    email,
    password: hashedPassword,
    role,
    avatar: avatarUrl,
    // otp,
    // otpExpire: new Date(now.getTime() + OTP_EXPIRE_DURATION),
    // otpSentAt: now,
    isVerified, // ✅ Directly mark as verified since OTP is skipped
    ...rest,
  });
  await manageUserNotification(newUser._id.toString(), {
    category: "SYSTEM",
    title: "🔥 Welcome to BattleZone!",
    message: "Your journey starts here! Set up your profile to unlock full access to tournaments, rewards, and more. Let’s gear up for victory!",
    type: "INFO",
    data: { action: "complete_profile" },
  });
  // 📨 Skipped sending OTP
  // await sendOTPEmail(email, otp);

  return newUser;
};

// export const registerUserService = async (userData) => {
//   const { email, password, role = "PLAYER", avatarFile, ...rest } = userData;

//   const now = new Date();
//   const existingUser = await User.findOne({ email, role });

//   // ✅ If user exists but not verified, just regenerate OTP
//   if (existingUser) {
//     if (existingUser.isVerified) {
//       throw new Error(`A ${role} with this email already exists.`);
//     }

//     // ⏱️ Prevent spamming OTP within cooldown
//     if (
//       existingUser.otpSentAt &&
//       now - existingUser.otpSentAt < OTP_RESEND_INTERVAL
//     ) {
//       const remaining = Math.ceil(
//         (OTP_RESEND_INTERVAL - (now - existingUser.otpSentAt)) / 1000
//       );
//       throw new Error(
//         `OTP already sent. Please wait ${remaining} seconds before requesting again.`
//       );
//     }

//     // 🔢 Generate new OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     existingUser.otp = otp;
//     existingUser.otpExpire = new Date(now.getTime() + OTP_EXPIRE_DURATION);
//     existingUser.otpSentAt = now;
//     await existingUser.save();

//     // 📧 Send OTP via SendGrid
//     await sendOTPEmail(email, otp);

//     return existingUser;
//   }

//   // 🔐 Hash password
//   const hashedPassword = await bcrypt.hash(password, 10);

//   // 🖼️ Upload avatar if provided
//   let avatarUrl;
//   if (avatarFile) {
//     avatarUrl = await uploadToCloudinary(avatarFile.path, "users");
//   }

//   // 🔢 Generate OTP for new user
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   const newUser = await User.create({
//     email,
//     password: hashedPassword,
//     role,
//     avatar: avatarUrl,
//     otp,
//     otpExpire: new Date(now.getTime() + OTP_EXPIRE_DURATION),
//     otpSentAt: now,
//     isVerified: false, // require email verification
//     ...rest,
//   });

//   // 📬 Send OTP Email
//   await sendOTPEmail(email, otp);

//   // 📨 Optional welcome notification
//   await manageUserNotification(newUser._id.toString(), {
//     category: "SYSTEM",
//     title: "🔥 Welcome to BattleZone!",
//     message:
//       "Your journey starts here! Set up your profile to unlock full access to tournaments, rewards, and more. Let’s gear up for victory!",
//     type: "INFO",
//     data: { action: "complete_profile" },
//   });

//   return newUser;
// };

export const verifyOTPService = async (email, otp, role = "PLAYER") => {
  // 1️⃣ Find user by email and role
  const user = await User.findOne({ email, role });
  if (!user) {
    throw Object.assign(new Error("No registration found"), { code: "NO_REGISTRATION" });
  }

  // 2️⃣ Check if already verified
  if (user.isVerified) {
    throw Object.assign(new Error("Account is already verified"), { code: "ALREADY_VERIFIED" });
  }

  // 3️⃣ Verify OTP
  if (user.otp !== otp) {
    // Invalid OTP
    throw Object.assign(new Error("Invalid OTP"), { code: "INVALID_OTP" });
  }

  // 4️⃣ Check OTP expiration
  if (!user.otpExpire || user.otpExpire.getTime() < Date.now()) {
    // OTP expired
    throw Object.assign(new Error("OTP expired"), {
      code: "OTP_EXPIRED",
      otpExpiresAt: user.otpExpire // frontend can use this for countdown
    });
  }

  // 5️⃣ Mark user as verified
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpire = undefined;
  user.otpSentAt = undefined;

  await user.save();

  // ✅ Return user
  return user;
};


export const resendOTPService = async (email, role = "PLAYER") => {
  const user = await User.findOne({ email, role });

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
  const user = await User.findOne({ email, role });

  if (!user) {
    throw new Error(`No ${role.toLowerCase()} account found for this email`);
  }

  // 🔒 Check if account is verified by admin
  if (!user.isVerified) {
    throw new Error("Please wait for admin to verify your account before logging in.");
  }

  // 🔑 Check password match
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Email or password do not match");
  }

  return user;
};


// export const forgotPasswordService = async (email, role) => {
//   const user = await User.findOne({ email, role });
//   if (!user) throw new Error(`No ${role.toLowerCase()} account found for this email`);

//   const tempPassword = generateStrongPassword();

//   const salt = await bcrypt.genSalt(10);
//   user.password = await bcrypt.hash(tempPassword, salt);
//   await user.save();

//   await sendForgotPasswordEmail(email, tempPassword, role);

//   return { email, tempPassword, role };
// };
export const forgotPasswordService = async ({ email, mobile, role, newPassword }) => {
  try {
    // ✅ Find user by email, mobile, and role
    const user = await User.findOne({ email, mobile, role });

    if (!user) {
      return {
        error: true,
        message: `No ${role.toLowerCase()} account found matching this email and mobile number.`,
      };
    }

    // ✅ Hash and update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    return {
      error: false,
      message: "Password updated successfully.",
    };
  } catch (error) {
    console.error("⚠️ forgotPasswordService error:", error);
    return {
      error: true,
      message: "Failed to update password. Please try again later.",
    };
  }
};