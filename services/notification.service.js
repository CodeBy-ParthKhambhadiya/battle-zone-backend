import Notification from "../models/notification.model.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Create and push a new notification to a user's list.
 */
export const createNotificationService = async (userId, notificationData) => {
  let userNotification = await Notification.findOne({ userId });

  const newNotification = {
    _id: uuidv4(),
    ...notificationData,
  };

  if (!userNotification) {
    userNotification = new Notification({
      userId,
      notifications: [newNotification],
    });
  } else {
    userNotification.notifications.unshift(newNotification);
  }

  await userNotification.save();
  return newNotification;
};

/**
 * Fetch all notifications for a given user.
 */
export const getUserNotificationsService = async (userId) => {
  const userNotifications = await Notification.findOne({ userId });
  return userNotifications ? userNotifications.notifications : [];
};

/**
 * Mark a specific notification as read.
 */

export const markAllNotificationsAsReadService = async (userId) => {
  const userNotifications = await Notification.findOne({ userId });
  if (!userNotifications) throw new Error("User notifications not found");

  // 🔁 Mark all as read
  userNotifications.notifications.forEach((notif) => {
    notif.isRead = true;
  });

  await userNotifications.save();

  return userNotifications.notifications;
};

/**
 * Delete a specific notification.
 */

export const deleteNotificationService = async (userId, notificationData) => {
  try {
    // 🧩 Handle case where second arg might be an object
    const notificationId =
      typeof notificationData === "object"
        ? notificationData.notificationId
        : notificationData;

    if (!notificationId || typeof notificationId !== "string") {
      return { success: false, message: "Invalid notification ID" };
    }

    // 🚀 Use $pull to delete directly from the array
    const result = await Notification.updateOne(
      { userId },
      { $pull: { notifications: { _id: notificationId } } }
    );

    if (result.modifiedCount === 0) {
      return { success: false, message: "Notification not found or already deleted" };
    }

    return { success: true, message: "Notification deleted successfully" };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, message: "Failed to delete notification" };
  }
};


/**
 * Delete all notifications for a user.
 */
export const clearAllNotificationsService = async (userId) => {
  try {
    const userNotifications = await Notification.findOne({ userId });

    if (!userNotifications) {
      return { success: false, message: "No notifications found for this user." };
    }

    // ✅ Clear all notifications
    userNotifications.notifications = [];
    await userNotifications.save();

    return { success: true, message: "All notifications cleared successfully." };
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return { success: false, message: "Failed to clear notifications." };
  }
};