import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import apiRoutes from "./routes/index.routes.js"; // your main router

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api", apiRoutes);

// Create HTTP server (important for Socket.IO)
const server = http.createServer(app);

// ✅ Initialize Socket.IO
export const io = new Server(server, {
  cors: {
    origin:"https://battle-zone-frontend.vercel.app", // change to your frontend URL in production
    // origin: "*", // change to your frontend URL in production
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// ✅ Handle Socket.IO connections
io.on("connection", (socket) => {

  // When a user joins their personal room
  socket.on("joinRoom", (userId) => {
    if (userId) {
      socket.join(userId);
    }
  });

  // Optional: leave room manually
  socket.on("leaveRoom", (userId) => {
    socket.leave(userId);
  });

  socket.on("disconnect", () => {
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
