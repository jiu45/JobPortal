// controllers/messageController.js
const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");
const { getIO, onlineUsers } = require("../socket");

const buildAttachments = (files) => {
  if (!files || !files.length) return [];

  return files.map((file) => ({
    url: `/uploads/messages/${file.filename}`,
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    type: file.mimetype.startsWith("image/") ? "image" : "file",
  }));
};

// POST /api/messages  (gửi text + file)
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user?._id || req.userId;

    if (!receiverId) {
      return res
        .status(400)
        .json({ success: false, message: "receiverId is required" });
    }

    if (!text && !req.files?.length) {
      return res.status(400).json({
        success: false,
        message: "Message text or at least one attachment is required",
      });
    }

    const attachments = buildAttachments(req.files);

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text: text || "",
      attachments,
    });

    const populated = await message.populate([
      { path: "sender", select: "name email avatar role" },
      { path: "receiver", select: "name email avatar role" },
    ]);

    // 🔔 Realtime cho người nhận nếu online
    try {
      const io = getIO();
      const receiverSocketId = onlineUsers.get(receiverId.toString());

      // Tính lại tổng unread của receiver
      const unreadCountReceiver = await Message.countDocuments({
        receiver: receiverId,
        isRead: false,
      });

      if (receiverSocketId) {
        // Gửi message mới
        io.to(receiverSocketId).emit("message:new", populated);

        // Gửi luôn unread count mới cho badge
        io.to(receiverSocketId).emit("unread:update", {
          count: unreadCountReceiver,
        });
      }

      // Nếu muốn đồng bộ multi-tab sender luôn (tuỳ bạn):
      const senderSocketId = onlineUsers.get(senderId.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit("message:sent", populated);
      }
    } catch (e) {
      console.error("Socket emit error:", e.message);
    }

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/messages/conversation/:userId
const getConversation = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.userId;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name email avatar role")
      .populate("receiver", "name email avatar role");

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("getConversation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/messages/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.userId;

    const count = await Message.countDocuments({
      receiver: currentUserId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("getUnreadCount error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/messages/mark-read/:userId
const markConversationRead = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.userId;
    const otherUserId = req.params.userId;

    await Message.updateMany(
      { receiver: currentUserId, sender: otherUserId, isRead: false },
      { $set: { isRead: true } }
    );

    // Tính lại unread count của current user
    const unreadCount = await Message.countDocuments({
      receiver: currentUserId,
      isRead: false,
    });

    // Emit cập nhật unread cho current user nếu đang online
    try {
      const io = getIO();
      const socketId = onlineUsers.get(currentUserId.toString());
      if (socketId) {
        io.to(socketId).emit("unread:update", { count: unreadCount });
      }
    } catch (e) {
      console.error("Socket emit (mark-read) error:", e.message);
    }

    res.status(200).json({
      success: true,
      message: "Updated",
    });
  } catch (error) {
    console.error("markConversationRead error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/messages/conversations  (list for dropdown / messages page)
const getConversationsList = async (req, res) => {
  try {
    const rawId = req.user?._id || req.userId;
    const currentUserId = new mongoose.Types.ObjectId(rawId);
    const limit = parseInt(req.query.limit, 10) || 20;

    const agg = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: currentUserId }, { receiver: currentUserId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", currentUserId] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$text" },
          lastMessageAt: { $first: "$createdAt" },
          lastMessageId: { $first: "$_id" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", currentUserId] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageAt: -1 } },
      { $limit: limit },
    ]);

    const otherUserIds = agg.map((item) => item._id);
    const users = await User.find({ _id: { $in: otherUserIds } }).select(
      "name email avatar role"
    );

    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = u;
    });

    const conversations = agg.map((item) => {
      const key = item._id.toString();
      return {
        _id: key,
        otherUser: userMap[key] || null,
        lastMessage: item.lastMessage,
        lastMessageAt: item.lastMessageAt,
        unreadCount: item.unreadCount,
      };
    });

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("getConversationsList error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getUnreadCount,
  markConversationRead,
  getConversationsList,
};
