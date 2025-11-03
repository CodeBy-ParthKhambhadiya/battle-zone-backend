import express from "express";
import {
  createNotification,
  getUserNotifications,
  deleteNotification,
  clearAllNotifications,
  markAllNotificationsAsRead,
} from "../controllers/notification.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/:userId", protect, createNotification);
router.get("/:userId", protect, getUserNotifications);
router.post("/me/read-all", protect, markAllNotificationsAsRead);
router.delete("/:userId/:notificationId", protect, deleteNotification);
router.delete("/:userId", protect, clearAllNotifications);

export default router;
