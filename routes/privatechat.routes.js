import express from "express";
import {
  createChatController,
  getChatsForUserController,
  getChatByIdController,
  addMessageController,
  deleteMessageController,
  editMessageController,
  getAllUsersController,
} from "../controllers/privatechat.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/all-users", protect, getAllUsersController);
router.post("/create", protect, createChatController);
router.get("/user", protect, getChatsForUserController);
router.get("/:chatId", protect, getChatByIdController);
router.post("/message", protect, addMessageController);
router.put("/message/edit", protect, editMessageController);
router.delete("/delete", protect, deleteMessageController);

export default router;
