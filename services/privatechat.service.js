import PrivateChat from "../models/privatechat.model.js";


// Create a new chat (or find existing between users)
export const createChatService = async ({ senderId, receiverId }) => {
  // Check if chat already exists
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

// Get all chats for a user
export const getChatsForUserService = async (userId) => {
  return PrivateChat.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
  }).sort({ updatedAt: -1 });
};

// Get single chat by ID
export const getChatByIdService = async (chatId) => {
  return PrivateChat.findById(chatId);
};

// Add message to chat
export const addMessageService = async (chatId, sender, message) => {
  const chat = await PrivateChat.findById(chatId);
  if (!chat) throw new Error("Chat not found");

  const newMessage = {
    sender,
    message,
    readBy: [sender], // sender has read it
  };

  chat.messages.push(newMessage);
  await chat.save();

  return newMessage;
};

// Delete chat
export const deleteMessageService = async (chatId, messageId, userId) => {
  const chat = await PrivateChat.findById(chatId);
  if (!chat) throw new Error("Chat not found");

  // Find the index of the message
  const messageIndex = chat.messages.findIndex((msg) => msg._id === messageId);
  if (messageIndex === -1) throw new Error("Message not found");

  const message = chat.messages[messageIndex];

  // Optional: Only the sender can delete their own message
  if (message.sender !== userId) throw new Error("Unauthorized to delete this message");

  // Remove the message using splice
  chat.messages.splice(messageIndex, 1);

  await chat.save();

  return chat; // Return updated chat
};


// Edit a message
export const editMessageService = async (chatId, messageId, senderId, newText) => {
  const chat = await PrivateChat.findById(chatId);
  if (!chat) throw new Error("Chat not found");

  const message = chat.messages.id(messageId);
  if (!message) throw new Error("Message not found");

  // Only the sender can edit the message
  if (message.sender !== senderId) throw new Error("Unauthorized");

  message.message = newText;
  await chat.save();

  return message;
};
