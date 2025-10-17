import express from "express";
import {
  sendMessageController,
  getMessagesController,
  getAllTournamentChatsController
} from "../controllers/tournamentchat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/message", protect, sendMessageController);
router.get("/:tournamentId", protect, getMessagesController);
router.get("/", protect, getAllTournamentChatsController);

export default router;
