import {
    createChatService,
    getChatsForUserService,
    getChatByIdService,
    addMessageService,
    editMessageService,
    deleteMessageService,
    getAllUsersService,
} from "../services/privatechat.service.js";

export const createChatController = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        const senderId = req.user.id;

        const { receiverId } = req.body;

        if (!receiverId) {
            return res.status(400).json({ message: "receiverId is required" });
        }

        const chat = await createChatService({ senderId, receiverId });
        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getChatsForUserController = async (req, res) => {
    try {
        const userId = req.user.id;
        const chats = await getChatsForUserService(userId);
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getChatByIdController = async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const chat = await getChatByIdService(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });
        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addMessageController = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        const senderId = req.user.id;
        const { chatId, message } = req.body;

        if (!chatId || !message) {
            return res.status(400).json({ message: "chatId and message are required" });
        }

        const newMessage = await addMessageService(chatId, senderId, message);
        res.status(201).json({
            status: "success",
            message: "Message sent successfully",
            data: newMessage
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteMessageController = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        const userId = req.user.id;
        const { chatId, messageId } = req.body;

        if (!chatId || !messageId) {
            return res.status(400).json({ message: "chatId and messageId are required" });
        }

        const updatedChat = await deleteMessageService(chatId, messageId, userId);

        res.status(200).json({
            message: "Message deleted successfully",
            updatedChat,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const editMessageController = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        const senderId = req.user.id;
        const { chatId, messageId, newText } = req.body;

        if (!chatId || !messageId || !newText) {
            return res.status(400).json({ message: "chatId, messageId, and newText are required" });
        }

        const updatedMessage = await editMessageService(chatId, messageId, senderId, newText);
        res.status(200).json({
            status: "success",
            message: "Message edited successfully",
            data: updatedMessage
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllUsersController = async (req, res) => {
  try {
    const currentUserId = req.user.id; // assuming you have auth middleware
    console.log("🚀 ~ getAllUsersController ~ currentUserId:", currentUserId)
    const users = await getAllUsersService(currentUserId);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: error.message });
  }
};