import { getUserByIdService, resetPasswordService, updateUserService } from "../services/user.service.js";

export const getUserByIdController = async (req, res) => {
  try {
    const userId = req.params.id;
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
    const updateData = req.body;

    const updatedUser = await updateUserService(userId, updateData);

    return res.status(200).json({
      error: false,
      message: "User updated successfully",
      data: updatedUser, // full user including password and __v
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
