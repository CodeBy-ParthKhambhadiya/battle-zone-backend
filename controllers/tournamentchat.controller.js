import {
  sendMessageService,
  getMessagesService
} from "../services/tournamentchat.service.js";



// Send a message in a tournament chat
export const sendMessageController = async (req, res) => {
  try {
    const { tournamentId, message } = req.body;
    const senderId = req.user._id; // from protect middleware

    const chat = await sendMessageService(tournamentId, senderId, message);

    res.status(200).json({ success: true, message: "Message sent", chat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all messages of a tournament chat
export const getMessagesController = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const chat = await getMessagesService(tournamentId);

    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
