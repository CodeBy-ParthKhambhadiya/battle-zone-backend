import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
// import tournamentRoutes from "./tournamentRoutes.js";

const router = express.Router();

// Base route
router.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

// Auth routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);

// Other routes (examples)
// router.use("/users", userRoutes);
// router.use("/tournaments", tournamentRoutes);

export default router;
