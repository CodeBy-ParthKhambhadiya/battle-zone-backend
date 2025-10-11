import User from "../models/user.modle.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";


export const getUserByIdService = async (userId) => {
  const user = await User.findById(userId); // full user including password and __v
  if (!user) throw new Error("User not found");
  return user;
};

export const updateUserService = async (userId, updateData) => {
  // Find the user by ID
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Update allowed fields
  Object.keys(updateData).forEach((key) => {
    user[key] = updateData[key];
  });

  // Save the updated user
  const updatedUser = await user.save();

  return updatedUser;
};

export const resetPasswordService = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Check old password
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Old password is incorrect");

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  // Save updated user
  const updatedUser = await user.save();
  return updatedUser;
};