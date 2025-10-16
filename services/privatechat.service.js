import PrivateChat from "../models/privatechat.model.js";
import User from "../models/user.modle.js";

export const createChatService = async ({ senderId, receiverId }) => {
  let chat = await PrivateChat.findOne({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  });

  if (!chat) {
    chat = await PrivateChat.create({ senderId, receiverId });
  }

  return chat;
};


export const getChatsForUserService = async (userId) => {
  // Find all chats involving this user
  const chats = await PrivateChat.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
  }).sort({ updatedAt: -1 });

  // Populate the other user for each chat
  const chatsWithOtherUser = await Promise.all(
    chats.map(async (chat) => {
      // Determine who is the other user
      const otherUserId = chat.senderId.toString() === userId ? chat.receiverId : chat.senderId;

      // Fetch other user details
      const otherUser = await User.findById(otherUserId);

      return {
        ...chat.toObject(),
        otherUser, // attach the other user's info
      };
    })
  );

  return chatsWithOtherUser;
};
export const getChatByIdService = async (chatId) => {
  return PrivateChat.findById(chatId);
};

export const addMessageService = async (chatId, sender, message) => {
  const chat = await PrivateChat.findById(chatId);
  if (!chat) throw new Error("Chat not found");

  const newMessage = {
    sender,
    message,
    readBy: [sender], 
  };

  chat.messages.push(newMessage);
  await chat.save();

  return newMessage;
};

export const deleteMessageService = async (chatId, messageId, userId) => {
  const chat = await PrivateChat.findById(chatId);
  if (!chat) throw new Error("Chat not found");

  const messageIndex = chat.messages.findIndex((msg) => msg._id === messageId);
  if (messageIndex === -1) throw new Error("Message not found");

  const message = chat.messages[messageIndex];
  if (message.sender !== userId) throw new Error("Unauthorized to delete this message");
  chat.messages.splice(messageIndex, 1);

  await chat.save();

  return chat; 
};


export const editMessageService = async (chatId, messageId, senderId, newText) => {
  const chat = await PrivateChat.findById(chatId);
  if (!chat) throw new Error("Chat not found");

  const message = chat.messages.id(messageId);
  if (!message) throw new Error("Message not found");

  if (message.sender !== senderId) throw new Error("Unauthorized");

  message.message = newText;
  await chat.save();

  return message;
};


export const getAllUsersService = async (currentUserId) => {
  
  const users = await User.find({ _id: { $ne: currentUserId } });

  return users;
};