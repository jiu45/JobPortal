// socket.js
const { Server } = require("socket.io");

let io = null;
const onlineUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // dev thì để *, xong chỉnh lại sau
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    //Client send userId after connection
    socket.on("register", (userId) => {
      if (userId) {
        onlineUsers.set(userId.toString(), socket.id);
        console.log("User registered:", userId, "->", socket.id);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      for (const [userId, sId] of onlineUsers.entries()) {
        if (sId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is initiated. Call initSocket(server) before.");
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
  onlineUsers,
};
