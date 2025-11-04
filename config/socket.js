import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
 io = new Server(server, {
  cors: {
    origin:"https://battle-zone-frontend.vercel.app", // change to your frontend URL in production
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

  io.on("connection", (socket) => {
    console.log("🟢 New socket connected:", socket.id);

    socket.on("joinRoom", (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined their room`);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) throw new Error("Socket.io not initialized yet!");
  return io;
};
