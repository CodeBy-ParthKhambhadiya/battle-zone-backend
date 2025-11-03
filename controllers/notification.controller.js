import {
    createNotificationService,
    getUserNotificationsService,
    deleteNotificationService,
    clearAllNotificationsService,
    markAllNotificationsAsReadService,
} from "../services/notification.service.js";

/**
 * @desc Create a new notification for a user
 */
export const createNotification = async (req, res) => {
    try {
        const { userId } = req.params;
        const notificationData = req.body;

        const notification = await createNotificationService(userId, notificationData);

        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            data: notification,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getUserNotifications = async (req, res) => {
    try {

        // ✅ Correctly extract userId
        const userId = req.user.id;

        // ✅ Call the service function properly
        const notifications = await getUserNotificationsService(userId);

        res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("🟢 [Notification] Marking all as read for user:", userId);

    const updated = await markAllNotificationsAsReadService(userId);

    if (!updated) {
      console.warn("⚠️ [Notification] No notifications found for user:", userId);
    } else {
      console.log(
        `✅ [Notification] ${updated.modifiedCount || 0} notifications marked as read for user: ${userId}`
      );
    }

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: updated,
    });
  } catch (error) {
    console.error("❌ [Notification] Error while marking notifications as read:");
    console.error("   → Message:", error.message);
    console.error("   → Stack:", error.stack);

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};



export const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params;
        const userId = req.user.id;

        const result = await deleteNotificationService(userId, notificationId);

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
            data: result,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const clearAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await clearAllNotificationsService(userId);

        res.status(200).json({
            success: true,
            message: "All notifications cleared",
            data: result,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
