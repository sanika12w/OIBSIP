import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--flame-primary)", fontWeight: 700, fontSize: "1.1rem" }}>
          Authenticating Kitchen Session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={adminOnly ? "/admin/login" : "/auth"} state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
