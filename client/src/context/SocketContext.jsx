import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const activeToken = token || localStorage.getItem("pizza_token");

    const socketInstance = io(window.location.origin, {
      transports: ["websocket", "polling"],
      auth: { token: activeToken },
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("[Socket.IO] Connected to live updates server (ID:", socketInstance.id, ")");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[Socket.IO] Disconnected from server:", reason);
      setIsConnected(false);
    });

    socketInstance.on("auth_error", (err) => {
      console.warn("[Socket.IO Authorization Error]:", err.message);
    });

    socketInstance.on("room_joined", (data) => {
      console.log(`[Socket.IO] Successfully subscribed to order room: order_${data.orderId}`);
    });

    socketInstance.on("admin_room_joined", () => {
      console.log("[Socket.IO] Successfully subscribed to admin_room");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  const joinOrderRoom = (orderId) => {
    if (socket && orderId) {
      const currentToken = token || localStorage.getItem("pizza_token");
      socket.emit("join_order_room", { orderId, token: currentToken });
    }
  };

  const joinAdminRoom = () => {
    if (socket) {
      const currentToken = token || localStorage.getItem("pizza_token");
      socket.emit("join_admin_room", { token: currentToken });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinOrderRoom, joinAdminRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
