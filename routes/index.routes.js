import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import tournamentRoutes from "./tournament.routes.js";
import tournamentJoinRoutes from "./tournamentjoin.routes.js";
import tournamentChatRoutes from "./tournamentchat.routes.js";
import privateChatRoutes from "./privatechat.routes.js"; // <-- import private chat routes

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/tournaments", tournamentRoutes);
router.use("/tournaments/chat", tournamentChatRoutes);
router.use("/tournament-join", tournamentJoinRoutes);
router.use("/private-chat", privateChatRoutes);

export default router;
