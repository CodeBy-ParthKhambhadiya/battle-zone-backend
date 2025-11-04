import { io } from "../server.js"; // Make sure server.js exports io
import PrivateChat from "../models/privatechat.model.js";

/**
 * Emit a message to both participants in a private chat.
 *
 * @param {String} chatId - The chat or conversation ID (UUID).
 * @param {String} senderId - The ID of the user who sent the message.
 * @param {Object} messageData - The message object (text, timestamp, etc.).
 */
export const emitMessage = async (chatId, senderId, messageData) => {
  try {
    // ✅ Fetch the chat using the UUID
    const chat = await PrivateChat.findById(chatId).select("senderId receiverId").lean();

    if (!chat) {
      console.warn("⚠️ Chat not found:", chatId);
      return;
    }

    // ✅ Determine participants
    const participants = [chat.senderId, chat.receiverId];
    const messageWithTime = {
      ...messageData,
      sentAt: new Date().toISOString(),
    };
    // ✅ Emit the new message to both users’ socket rooms
    participants.forEach((userId) => {
      io.to(userId).emit("newMessage", {
        chatId,
        senderId,
        message: messageWithTime,
      });
    });

    console.log(`📨 Message emitted from ${senderId} to chat ${chatId} for users: ${participants.join(", ")}`);
  } catch (error) {
    console.error("❌ Socket emit error:", error.message);
  }
};
