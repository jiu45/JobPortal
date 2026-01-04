import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../socket";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (user && user._id) {
      socket.emit("register", user._id);
    }
  }, [user?._id]);

  const logout = ({
    redirect = true,
    toastMsg = "",
    redirectTo = "/", 
  } = {}) => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);

    if (toastMsg) {
      sessionStorage.setItem("AUTH_TOAST", toastMsg);
    }

    if (redirect) {
      window.location.href = redirectTo;
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // ✅ check token expired
      try {
        const decoded = jwtDecode(token);
        const expMs = (decoded?.exp || 0) * 1000;

        if (!expMs || Date.now() >= expMs) {
          logout({
            redirect: true,
            toastMsg: "Your login session has expired. Please log in again.",
          });
          return;
        }
      } catch (e) {
        // token invalid
        logout({
          redirect: true,
          toastMsg: "The login session is invalid. Please log in again.",
        });
        return;
      }

      // token ok -> set user
      const userData = JSON.parse(userStr);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check failed:", error);
      logout({ redirect: true });
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const updateUser = (updateUserData) => {
    const newUserData = { ...user, ...updateUserData };
    localStorage.setItem("user", JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
