import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import tournamentRoutes from "./tournament.routes.js";
import tournamentJoinRoutes from "./tournamentjoin.routes.js";

const router = express.Router();

// Base route
router.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

// Auth routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/tournaments", tournamentRoutes);
router.use("/tournament-join", tournamentJoinRoutes);

// Other routes (examples)
// router.use("/users", userRoutes);
// router.use("/tournaments", tournamentRoutes);

export default router;
