import axiosInstance from "./axiosInstance";
import { API_PATHS } from "./apiPaths";

// Conservations List (dropdown + messages page)
export const getConversations = (limit = 20) => {
  return axiosInstance.get(API_PATHS.MESSAGE.GET_CONVERSATIONS, {
    params: { limit },
  });
};

// Get all messages in a conversation with a specific user
export const getConversationMessages = (userId) => {
  return axiosInstance.get(API_PATHS.MESSAGE.GET_CONVERSATION(userId));
};

// Send message (text + file)
export const sendMessageApi = (payload) => {
  // payload will be FormData
  return axiosInstance.post(API_PATHS.MESSAGE.SEND, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Total unread messages
export const getUnreadCountApi = () => {
  return axiosInstance.get(API_PATHS.MESSAGE.GET_UNREAD_COUNT);
};

// Mark conversation as read
export const markConversationReadApi = (userId) => {
  return axiosInstance.patch(API_PATHS.MESSAGE.MARK_READ(userId));
};
