import TournamentChat from "../models/tournamentchat.modle.js";

export const sendMessageService = async (tournamentId, senderId, message) => {
  const chat = await TournamentChat.findOne({ tournament: tournamentId });
  if (!chat) throw new Error("Chat not found for this tournament");

  chat.messages.push({ sender: senderId, message, sentAt: new Date() });
  await chat.save();

  await chat.populate("messages.sender", "firstName lastName username email avatarFile");
  await chat.populate("organizer", "firstName lastName username email avatarFile");

  return chat;
};

export const getMessagesService = async (tournamentId) => {
  const chat = await TournamentChat.findOne({ tournament: tournamentId });

  if (!chat) throw new Error("Chat not found");

  await chat.populate("messages.sender", "firstName lastName username email avatarFile");

  await chat.populate("organizer", "firstName lastName username email avatarFile");

  return chat;
};