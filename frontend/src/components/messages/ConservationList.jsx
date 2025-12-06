import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { getConversations } from "../../utils/messageApi";

const Avatar = ({ user }) => {
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className="h-10 w-10 rounded-full object-cover flex-shrink-0"
      />
    );
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold flex-shrink-0">
      {initials}
    </div>
  );
};

const ConversationList = ({ selectedUser, onSelectUser }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await getConversations(50);
      setConversations(res.data.data || []);
    } catch (err) {
      console.error("load conversations error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const selectedId = selectedUser?._id;

  return (
    <div className="h-full bg-white rounded-xl shadow-md border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Messages</h2>
          <p className="text-xs text-gray-500">Your recent conversations</p>
        </div>
        <button
          onClick={loadConversations}
          className="p-1.5 rounded-lg hover:bg-gray-100"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-500">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-500 px-4">
            No conversations yet. Start messaging your candidates or employers.
          </div>
        ) : (
          conversations.map((conv) => {
            const user = conv.otherUser;
            const isActive = user?._id === selectedId;

            return (
              <button
                key={conv._id}
                onClick={() => onSelectUser(user)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 ${
                  isActive ? "bg-blue-50" : ""
                }`}
              >
                <Avatar user={user} />
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {user?.name || "Unknown user"}
                    </span>
                    <span className="ml-2 text-[11px] text-gray-400 flex-shrink-0">
                      {conv.lastMessageAt
                        ? new Date(conv.lastMessageAt).toLocaleDateString(
                            [],
                            { month: "short", day: "numeric" }
                          )
                        : ""}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {conv.lastMessage || "[Attachment]"}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="ml-2 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
