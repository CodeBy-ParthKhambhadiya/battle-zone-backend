import PrivateChat from "../models/privatechat.model.js";
import { getIo } from "../config/socket.js";

export const emitMessage = async (chatId, senderId, messageData) => {
  try {
    const io = getIo(); // ✅ safely get instance
    const chat = await PrivateChat.findById(chatId).select("senderId receiverId").lean();

    if (!chat) return;

    const participants = [String(chat.senderId), String(chat.receiverId)];
    const messageWithTime = { ...messageData, sentAt: new Date().toISOString() };

    participants.forEach((userId) => {
      io.to(userId).emit("newMessage", { chatId, senderId, message: messageWithTime });
    });

    console.log(`📨 Message emitted for users: ${participants.join(", ")}`);
  } catch (err) {
    console.error("❌ emitMessage error:", err);
  }
};
