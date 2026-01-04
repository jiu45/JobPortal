import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor: attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper: logout once (avoid spam)
let isRedirecting = false;

const redirectToLoginWithToast = (message) => {
  if (isRedirecting) return;
  isRedirecting = true;

  // ✅ Save message so Login page can toast after redirect
  sessionStorage.setItem("AUTH_TOAST", message);

  // ✅ Clear local auth
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  // ✅ Redirect (change to /login if your login route is /login)
  window.location.href = "/";
};

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // timeout
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
      return Promise.reject(error);
    }

    if (error.response) {
      const status = error.response.status;
      const serverCode = error.response.data?.code;
      const serverMsg = error.response.data?.message;

      if (status === 401) {
        const serverCode = error.response.data?.code;
        const serverMsg = (error.response.data?.message || "").toLowerCase();

        // message đẹp cho user
        const friendlyMsg =
            serverCode === "TOKEN_EXPIRED" ||
            serverMsg.includes("expired") ||
            serverMsg.includes("jwt expired")
            ? "Your login session has expired. Please log in again."
            : "You are not logged in, or your session has expired. Please log in again.";

        // ✅ không dùng serverMsg trực tiếp nữa
        redirectToLoginWithToast(friendlyMsg);
        } else if (status === 500) {
        console.error("Server Error:", serverMsg);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
