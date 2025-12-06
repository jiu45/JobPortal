const express = require("express");
const {
  sendMessage,
  getConversation,
  getUnreadCount,
  markConversationRead,
  getConversationsList, 
} = require("../controllers/messageController");
const {protect} = require("../middlewares/authMiddleware");
const messageUploadMiddleware = require("../middlewares/messageUploadMiddleware");

const router = express.Router();

// Send message
// multipart/form-data
router.post(
  "/",
  protect,
  messageUploadMiddleware,
  sendMessage
);

// Get conversation with a specific user
router.get(
  "/conversation/:userId",
  protect,
  getConversation
);

// Total unread messages
router.get("/unread-count", protect, getUnreadCount);
router.get("/conversations", protect, getConversationsList);
// Mark conversation as read
router.patch(
  "/mark-read/:userId",
  protect,
  markConversationRead
);

module.exports = router;
