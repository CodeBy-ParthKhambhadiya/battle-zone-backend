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
    // origin: "http://localhost:3000", // change to your frontend URL in production
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 New socket connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`👤 User ${userId} joined their room`);
    }
  });

  socket.on("leaveRoom", (userId) => {
    socket.leave(userId);
    console.log(`🚪 User ${userId} left the room`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});


// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
