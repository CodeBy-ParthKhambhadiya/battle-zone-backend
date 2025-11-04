import Notification from "../models/notification.model.js";
import { v4 as uuidv4 } from "uuid";
import { getIo } from "../config/socket.js";

export const manageUserNotification = async (userId, data) => {
  try {
    const io = getIo(); // ✅ safe access
    const newNotification = {
      _id: uuidv4(),
      category: data.category || "GENERAL",
      title: data.title || "Notification",
      message: data.message || "",
      type: data.type || "INFO",
      data: data.data || {},
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    let userNotif = await Notification.findOne({ userId });
    if (!userNotif) {
      userNotif = await Notification.create({ userId, notifications: [newNotification] });
    } else {
      userNotif.notifications.unshift(newNotification);
      await userNotif.save();
    }

    io.to(userId).emit("notification", newNotification);
    console.log(`🔔 Notification sent to ${userId}`);

    return newNotification;
  } catch (err) {
    console.error("❌ manageUserNotification error:", err);
  }
};
