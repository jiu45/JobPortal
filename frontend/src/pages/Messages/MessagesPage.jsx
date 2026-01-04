import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Navbar from "../../components/layout/Navbar";
import ConversationList from "../../components/messages/ConservationList";
import MessagesChatPanel from "../../components/messages/MessagesChatPanel";
import { useAuth } from "../../context/AuthContext";

const MessagesContent = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4">
      {/* Left: conversations */}
      <div className="w-full md:w-1/3 h-full">
        <ConversationList
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
        />
      </div>

      {/* Right: chat */}
      <div className="flex-1 h-full">
        <MessagesChatPanel otherUser={selectedUser} />
      </div>
    </div>
  );
};

const MessagesPage = () => {
  const { user } = useAuth();

  // Employer → bọc trong DashboardLayout
  if (user?.role === "employer") {
    return (
      <DashboardLayout activeMenu="messages">
        <MessagesContent />
      </DashboardLayout>
    );
  }

  // Jobseeker → layout đơn giản
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar giống các trang jobseeker khác */}
      <Navbar />

      <main className="pt-20 max-w-6xl mx-auto px-4 pb-6">
        <header className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold text-gray-900">
              Messages
            </h1>
            <p className="text-xs text-gray-500">
              Chat with employers and manage your conversations.
            </p>
          </div>
        </header>

        <MessagesContent />
      </main>
    </div>
  );
};

export default MessagesPage;
