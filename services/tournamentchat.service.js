import TournamentChat from "../models/tournamentchat.modle.js";
import TournamentJoin from "../models/tournamentjoin.modle.js";
import Tournament from "../models/tournament.modle.js";

export const sendMessageService = async (tournamentId, senderId, message) => {
  // Check if the user has joined the tournament and status is "confirmed"
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new Error("Tournament not found");
  }

  // Allow if sender is the organizer
  if (tournament.organizer_id.toString() === senderId.toString()) {
    // Organizer is allowed, skip joinRecord check
  } else {
    // Otherwise, ensure player is confirmed
    const joinRecord = await TournamentJoin.findOne({
      tournament: tournamentId,
      player: senderId,
      status: "confirmed",
    });

    if (!joinRecord) {
      throw new Error("Sender is not confirmed for this tournament");
    }
  }

  // Find the chat for the tournament
  const chat = await TournamentChat.findOne({ tournament: tournamentId });
  if (!chat) throw new Error("Chat not found for this tournament");

  // Create the new message object
  const newMessage = { sender: senderId, message, sentAt: new Date() };

  // Add the message to the chat
  chat.messages.push(newMessage);
  await chat.save();

  // Populate sender and organizer fields
  await chat.populate("messages.sender", "firstName lastName username email avatarFile");
  await chat.populate("organizer", "firstName lastName username email avatarFile");

  // Find the latest message after population
  const populatedNewMessage = chat.messages[chat.messages.length - 1];

  return { chat, newMessage: populatedNewMessage };
};

export const getMessagesService = async (tournamentId) => {
  const chat = await TournamentChat.findOne({ tournament: tournamentId });

  if (!chat) throw new Error("Chat not found");

  await chat.populate("messages.sender", "firstName lastName username email avatarFile");

  await chat.populate("organizer", "firstName lastName username email avatarFile");

  return chat;
};



export const getAllTournamentChatsService = async () => {
  const chats = await TournamentChat.find()
    .populate("tournament")        // Populate tournament info
    .populate("organizer")         // Populate organizer info
    .populate("messages.sender")   // Populate sender info for each message
    .sort({ createdAt: 1 })        // Sort by chat creation date
    .lean();

  return chats;
};