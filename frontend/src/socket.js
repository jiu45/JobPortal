// src/socket.js
import { io } from "socket.io-client";

export const socket = io(
  // Use relative path so it goes through Vite proxy (which goes to backend)
  // or default to window.location if in production
  {
    transports: ["websocket"],
    withCredentials: true,
  }
);
