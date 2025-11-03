import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const notificationItemSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    category: {
      type: String,
      enum: ["TOURNAMENT", "CHAT", "SYSTEM", "WALLET", "GENERAL"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["INFO", "SUCCESS", "WARNING", "ERROR"],
      default: "INFO",
    },
    isRead: { type: Boolean, default: false },
    data: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userNotificationSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    userId: {
      type: String,
      ref: "User",
      unique: true,
      required: true,
    },
    notifications: [notificationItemSchema],
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", userNotificationSchema);
export default Notification;
