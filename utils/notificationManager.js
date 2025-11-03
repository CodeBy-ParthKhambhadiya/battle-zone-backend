import Notification from "../models/notification.model.js";
import { io } from "../server.js"; // make sure server exports io
import { v4 as uuidv4 } from "uuid";

/**
 * Manages notifications for a user and emits through Socket.IO.
 *
 * @param {String} userId - Target user's ID
 * @param {Object} notificationData - Notification details
 * @returns {Object} The newly created notification
 */
export const manageUserNotification = async (userId, notificationData) => {
  try {
    const newNotification = {
      _id: uuidv4(),
      category: notificationData.category || "GENERAL",
      title: notificationData.title || "Notification",
      message: notificationData.message || "",
      type: notificationData.type || "INFO",
      data: notificationData.data || {},
      isRead: false,
      createdAt: new Date(),
    };

    // Find or create user's notification record
    let userNotif = await Notification.findOne({ userId });

    if (!userNotif) {
      userNotif = await Notification.create({
        userId,
        notifications: [newNotification],
      });
    } else {
      userNotif.notifications.unshift(newNotification);
      await userNotif.save();
    }

    // Emit in real-time via Socket.IO
    io.to(userId).emit("notification", newNotification);

    return newNotification;
  } catch (error) {
    console.error("❌ Error managing user notification:", error);
    throw error;
  }
};
