import TournamentChat from "../models/tournamentchat.modle.js";



// Send a message in a tournament chat
export const sendMessageService = async (tournamentId, senderId, message) => {
  const chat = await TournamentChat.findOne({ tournament: tournamentId });
  if (!chat) throw new Error("Chat not found for this tournament");

  // Add the message
  chat.messages.push({ sender: senderId, message, sentAt: new Date() });
  await chat.save();

  // Populate sender details in all messages
  await chat.populate("messages.sender", "firstName lastName username email avatarFile");
  await chat.populate("organizer", "firstName lastName username email avatarFile");

  return chat;
};

// Get all messages for a tournament chat
export const getMessagesService = async (tournamentId) => {
  const chat = await TournamentChat.findOne({ tournament: tournamentId });

  if (!chat) throw new Error("Chat not found");

  // Populate sender details for each message
  await chat.populate("messages.sender", "firstName lastName username email avatarFile");

  // Populate organizer details
  await chat.populate("organizer", "firstName lastName username email avatarFile");

  return chat;
};