import {
  sendMessageService,
  getMessagesService,
  getAllTournamentChatsService
} from "../services/tournamentchat.service.js";



export const sendMessageController = async (req, res) => {
  try {
    const { tournamentId, message } = req.body;
    const senderId = req.user._id;

    // Destructure the returned object from service
    const { chat, newMessage } = await sendMessageService(tournamentId, senderId, message);

    // Respond with the updated chat and the new message separately
    res.status(200).json({
      success: true,
      message: "Message sent",
      chat,
      newMessage, // makes it easy for frontend to append in real-time
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMessagesController = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const chat = await getMessagesService(tournamentId);

    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllTournamentChatsController = async (req, res) => {
  try {
    console.log("📨 Fetching all tournament chats...");

    const chats = await getAllTournamentChatsService();

    console.log("✅ Tournament chats fetched successfully:", chats?.length || 0);

    return res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    console.error("❌ Error fetching tournament chats:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tournament chats",
    });
  }
}