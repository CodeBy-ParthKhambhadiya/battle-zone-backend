import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import tournamentRoutes from "./tournament.routes.js";
import tournamentJoinRoutes from "./tournamentjoin.routes.js";
import tournamentChatRoutes from "./tournamentchat.routes.js";
import privateChatRoutes from "./privatechat.routes.js";
import tournamentCommentRoutes from "./tournamentcomment.routes.js";
import transactionRoutes from "./transaction.routes.js";
import notificationRoutes from "./notification.routes.js"; // ✅ import notification routes

const router = express.Router();

// Health check route
router.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

// Register routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/tournaments", tournamentRoutes);
router.use("/tournaments-chat", tournamentChatRoutes);
router.use("/tournament-join", tournamentJoinRoutes);
router.use("/private-chat", privateChatRoutes);
router.use("/tournament-comment", tournamentCommentRoutes);
router.use("/transactions", transactionRoutes);
router.use("/notifications", notificationRoutes); // ✅ add this line

export default router;
