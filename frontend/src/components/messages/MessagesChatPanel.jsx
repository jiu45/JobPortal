// src/components/messages/MessagesChatPanel.jsx
import { useEffect, useRef, useState } from "react";
import { Send, Image as ImageIcon, Paperclip } from "lucide-react";
import {
  getConversationMessages,
  sendMessageApi,
  markConversationReadApi,
} from "../../utils/messageApi";
import { buildFileUrl } from "../../utils/fileHelpers";
import { socket } from "../../socket"; // 👈 thêm socket

// Avatar real image, fallback to initials
const Avatar = ({ user, size = 36 }) => {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "?";

  const baseClasses =
    "flex items-center justify-center rounded-full text-xs font-semibold";
  const sizeClasses =
    size === 32
      ? "h-8 w-8"
      : size === 36
      ? "h-9 w-9"
      : "h-8 w-8"; // fallback

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${sizeClasses} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${baseClasses} ${sizeClasses} bg-blue-100 text-blue-700`}
    >
      {initials}
    </div>
  );
};

const MessagesChatPanel = ({ otherUser }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const loadMessages = async () => {
    if (!otherUser?._id) return;
    try {
      setLoading(true);
      const res = await getConversationMessages(otherUser._id);
      setMessages(res.data?.data || []);

      //Mark as read
      await markConversationReadApi(otherUser._id);
    } catch (err) {
      console.error("load conversation error:", err);
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  useEffect(() => {
    if (otherUser?._id) {
      loadMessages();
    } else {
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUser?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // 👇 Lắng nghe tin nhắn mới realtime
  useEffect(() => {
    if (!otherUser?._id) return;

    const handleNewMessage = async (msg) => {
      const sender = msg.sender;
      const senderId =
        (typeof sender === "string" && sender) ||
        sender?._id ||
        sender?.id ||
        null;

      // only append message if it's from the otherUser in this chat panel
      if (!senderId || senderId.toString() !== otherUser._id.toString()) {
        return;
      }

      setMessages((prev) => [...prev, msg]);
      scrollToBottom();

      try {
        await markConversationReadApi(otherUser._id);
      } catch (e) {
        console.error("mark read in MessagesChatPanel error:", e);
      }
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [otherUser?._id]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleSend = async () => {
    if (!otherUser?._id) return;
    if (!text.trim() && files.length === 0) return;

    try {
      setSending(true);
      const formData = new FormData();
      formData.append("receiverId", otherUser._id);
      if (text.trim()) formData.append("text", text.trim());
      files.forEach((file) => formData.append("attachments", file));

      const res = await sendMessageApi(formData);
      const newMsg = res.data?.data;
      setMessages((prev) => [...prev, newMsg]);
      setText("");
      setFiles([]);
      scrollToBottom();
    } catch (err) {
      console.error("send message error:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!otherUser) {
    return (
      <div className="h-full bg-white rounded-xl shadow-md border border-gray-200 flex items-center justify-center text-sm text-gray-500">
        Select a conversation on the left to start chatting.
      </div>
    );
  }

  const renderBubble = (msg) => {
    const isMine = msg.sender && otherUser && msg.sender._id !== otherUser._id;

    return (
      <div
        key={msg._id}
        className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
            isMine
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
          }`}
        >
          {msg.text && (
            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
          )}

          {msg.attachments && msg.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {msg.attachments.map((att) => {
                const fileUrl = buildFileUrl(att.url);
                return att.type === "image" ? (
                  <a
                    key={att.url}
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={fileUrl}
                      alt={att.filename}
                      className="max-h-52 rounded-xl border border-gray-200"
                    />
                  </a>
                ) : (
                  <a
                    key={att.url}
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] underline break-all"
                  >
                    <Paperclip className="h-3 w-3" />
                    {att.filename}
                  </a>
                );
              })}
            </div>
          )}

          <span className="block mt-1 text-[10px] opacity-70 text-right">
            {new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-white rounded-xl shadow-md border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <Avatar user={otherUser} size={36} />
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {otherUser.name}
          </div>
          <div className="text-[11px] text-gray-500 capitalize">
            {otherUser.role}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-3 overflow-y-auto bg-gray-50/60">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-500">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-500 text-center px-4">
            No messages yet. Say hi 👋
          </div>
        ) : (
          messages.map(renderBubble)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input: One row [attach] [textarea] [send] same ChatWindow */}
      <div className="border-t border-gray-100 px-3 py-2 bg-white">
        <div className="flex items-center gap-2">
          {/* Button file/image */}
          <label
            className="flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors shrink-0"
            title="Attach photo / file"
          >
            <ImageIcon className="h-4 w-4 text-gray-600" />
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Text type area */}
          <textarea
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Type a message..."
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={sending || (!text.trim() && files.length === 0)}
            className="h-9 w-9 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {files.length > 0 && (
          <p className="mt-1 text-[11px] text-gray-400">
            {files.length} file(s) selected
          </p>
        )}
      </div>
    </div>
  );
};

export default MessagesChatPanel;
