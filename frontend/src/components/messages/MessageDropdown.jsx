// src/components/messages/MessageDropdown.jsx
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getConversations,
  getUnreadCountApi,
  markConversationReadApi,
} from "../../utils/messageApi";
import { socket } from "../../socket";

const Avatar = ({ user }) => {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "?";

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
      {initials}
    </div>
  );
};

const MessageDropdown = ({ onOpenChat }) => {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 👉 Đang ở trang /messages thì KHÔNG hiện icon nữa
  if (location.pathname === "/messages") {
    return null;
  }

  // 👉 Load tổng số tin chưa đọc ngay khi mount
  useEffect(() => {
    const loadUnread = async () => {
      try {
        const res = await getUnreadCountApi();
        setUnreadCount(res.data?.data?.count || 0);
      } catch (err) {
        console.error("load unread error:", err);
      }
    };

    loadUnread();
  }, []);

  // 👉 Lắng nghe realtime từ socket
  useEffect(() => {
    // cập nhật tổng unread khi backend emit
    const handleUnreadUpdate = ({ count }) => {
      setUnreadCount(count);
    };

    // khi có tin nhắn mới realtime
    const handleNewMessage = (message) => {
      // tăng badge tạm (backend thường emit cho receiver)
      setUnreadCount((prev) => prev + 1);

      const sender = message.sender;
      const senderId =
        (typeof sender === "string" && sender) ||
        sender?._id ||
        sender?.id ||
        null;

      if (!senderId) return;

      setConversations((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((c) => c._id === senderId);

        if (idx === -1) {
          // chưa có cuộc trò chuyện này trong list → thêm mới
          updated.unshift({
            _id: senderId,
            otherUser: sender,
            lastMessage: message.text || "[Attachment]",
            lastMessageAt: message.createdAt,
            unreadCount: 1,
          });
        } else {
          // cập nhật last message + unreadCount
          const conv = { ...updated[idx] };
          conv.lastMessage = message.text || "[Attachment]";
          conv.lastMessageAt = message.createdAt;
          conv.unreadCount = (conv.unreadCount || 0) + 1;

          updated.splice(idx, 1);
          updated.unshift(conv); // đẩy cuộc trò chuyện đó lên đầu
        }

        return updated;
      });
    };
    
    socket.on("unread:update", handleUnreadUpdate);
    socket.on("message:new", handleNewMessage);  // theo backend mới (nếu bạn đổi tên)

    return () => {
      socket.off("unread:update", handleUnreadUpdate);
      socket.off("message:new", handleNewMessage);
    };
  }, []);

  // 👉 Chỉ load danh sách conversation khi dropdown mở
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const convRes = await getConversations(10);
      setConversations(convRes.data?.data || []);
    } catch (err) {
      console.error("load conversations error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchConversations();
    }
  }, [open]);

  // đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleToggle = (e) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  const handleOpenChat = async (conv) => {
    setOpen(false);
    try {
      if (conv.unreadCount > 0 && conv.otherUser?._id) {
        // API đang thiết kế theo userId, không phải conversationId
        await markConversationReadApi(conv.otherUser._id);

        // Cập nhật badge tạm thời
        setUnreadCount((prev) => Math.max(prev - conv.unreadCount, 0));

        // Cập nhật luôn trong list để số unread về 0
        setConversations((prev) =>
          prev.map((c) =>
            c._id === conv._id ? { ...c, unreadCount: 0 } : c
          )
        );
      }
    } catch (e) {
      console.error("mark read error", e);
    }

    // mở chat với otherUser (popup ChatWindow)
    onOpenChat && onOpenChat(conv.otherUser);
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate("/messages");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Icon + badge */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
      >
        <MessageCircle className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-40">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-900">
              Messages
            </span>
            <button
              onClick={handleViewAll}
              className="text-xs text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-gray-500 text-sm">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                No conversations yet
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => handleOpenChat(conv)}
                  className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <Avatar user={conv.otherUser} />
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conv.otherUser?.name || "Unknown user"}
                      </p>
                      <span className="ml-2 text-[11px] text-gray-400 whitespace-nowrap">
                        {conv.lastMessageAt
                          ? new Date(conv.lastMessageAt).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : ""}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 truncate">
                      {conv.lastMessage || "[Attachment]"}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="ml-2 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageDropdown;
