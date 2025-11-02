import { deleteUserServices, getAllUsersServices, getUserByIdService, resetPasswordService, updateUserService, verifyUserServices } from "../services/user.service.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export const getUserByIdController = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getUserByIdService(userId);

    return res.status(200).json({
      error: false,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      error: true,
      message: error.message,
    });
  }
};

export const updateUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = { ...req.body };
    
    if (req.file) {
      const avatarUrl = await uploadToCloudinary(req.file.path, "users");
      updateData.avatar = avatarUrl; 
    }
    const updatedUser = await updateUserService(userId, updateData);

    return res.status(200).json({
      error: false,
      message: "User updated successfully",
      data: updatedUser, 
    });
  } catch (error) {
    return res.status(400).json({
      error: true,
      message: error.message,
    }); 
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const userId = req.user._id; // from protect middleware
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        error: true,
        message: "Both oldPassword and newPassword are required",
      });
    }

    const updatedUser = await resetPasswordService(userId, oldPassword, newPassword);

    return res.status(200).json({
      error: false,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(400).json({
      error: true,
      message: error.message,
    });
  }
};

export const getUnverifiedUsersController = async (req, res) => {
  try {
    const users = await getAllUsersServices();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** ✅ Verify user (admin only) */

export const verifyUserController = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    const { id } = req.params;
    const { isVerified } = req.body;

    if (typeof isVerified !== "boolean") {
      return res.status(400).json({ message: "isVerified must be true or false" });
    }

    const user = await verifyUserServices(id, isVerified);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const statusText = isVerified ? "verified" : "disabled";
    res.status(200).json({
      message: `User has been ${statusText} successfully.`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** ❌ Delete user (admin only) */

// controllers/user.controller.js
export const deleteUserController = async (req, res) => {
  try {
    // Only admins can delete users
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    // ✅ Correct parameter name
    const { id } = req.params;

    const user = await deleteUserServices(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User deleted successfully",
      deletedUser: user,
    });
  } catch (error) {
    console.error("❌ Delete user error:", error);
    return res.status(500).json({ message: error.message });
  }
};
