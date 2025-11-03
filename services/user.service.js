import User from "../models/user.modle.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";


export const getUserByIdService = async (userId) => {
  const user = await User.findById(userId); 
  if (!user) throw new Error("User not found");
  return user;
};

export const updateUserService = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  Object.keys(updateData).forEach((key) => {
    user[key] = updateData[key];
  });

  const updatedUser = await user.save();

  return updatedUser;
};

export const resetPasswordService = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Old password is incorrect");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  const updatedUser = await user.save();
  return updatedUser;
};

/** 🧾 Get all unverified users */
export const getAllUsersServices = async () => {
  const users = await User.find()
    .select("-password -otp -otpExpire -otpSentAt -otpResendAt")
    .sort({ createdAt: -1 }); // newest first
  return users;
};

/** ✅ Verify a user (admin only) */

export const verifyUserServices = async (userId, isVerified) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isVerified },
    { new: true, runValidators: true }
  ).select("-password -otp -otpExpire -otpSentAt -otpResendAt");

  return user;
};


export const deleteUserServices = async (userId) => {
  
  const user = await User.findByIdAndDelete(userId).select(
    "-password -otp -otpExpire -otpSentAt -otpResendAt"
  );
  return user;
};

export const getAdminDetails = async () => {
  try {
    const admin = await User.findOne({ role: "ADMIN" })
      .select("-password -email -mobile"); // exclude sensitive fields

    return admin;
  } catch (error) {
    throw new Error("Failed to fetch admin details");
  }
};