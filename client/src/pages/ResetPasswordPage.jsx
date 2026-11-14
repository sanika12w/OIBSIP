import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { api } from "../api";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      const res = await api.auth.resetPassword({ token, newPassword });
      setSuccessMessage(res.message);
      setTimeout(() => {
        navigate("/auth");
      }, 2500);
    } catch (err) {
      setErrorMessage(err.message || "Failed to reset password. Link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "5rem 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="container" style={{ maxWidth: "440px" }}>
        <div className="glass-panel" style={{ padding: "2.5rem 2rem", borderRadius: "18px" }}>
          
          <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "var(--flame-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 0.75rem auto",
              }}
            >
              <Lock size={24} color="#FFF" />
            </div>
            <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "#FFF" }}>
              Reset Your Password
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Please enter your new secure password below.
            </p>
          </div>

          {errorMessage && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                color: "#F87171",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "0.75rem",
                borderRadius: "8px",
                marginBottom: "1.2rem",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <AlertCircle size={16} /> {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#34D399",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "0.75rem",
                borderRadius: "8px",
                marginBottom: "1.2rem",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <CheckCircle size={16} /> {successMessage} (Redirecting to login...)
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !!successMessage}
              className="btn-flame"
              style={{ marginTop: "0.5rem", padding: "0.85rem", fontSize: "0.98rem" }}
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <Link to="/auth" style={{ color: "var(--text-muted)", fontSize: "0.84rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
