import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("pizza_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("pizza_token");
      if (storedToken) {
        try {
          const data = await api.auth.getMe();
          setUser(data.user);
        } catch (err) {
          console.warn("Session expired or invalid token:", err.message);
          localStorage.removeItem("pizza_token");
          localStorage.removeItem("pizza_user");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const res = await api.auth.login(credentials);
    if (res.token && res.user) {
      localStorage.setItem("pizza_token", res.token);
      localStorage.setItem("pizza_user", JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.token && res.user) {
      localStorage.setItem("pizza_token", res.token);
      localStorage.setItem("pizza_user", JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem("pizza_token");
    localStorage.removeItem("pizza_user");
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await api.auth.updateProfile(profileData);
    if (res.user) {
      setUser(res.user);
      localStorage.setItem("pizza_user", JSON.stringify(res.user));
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
