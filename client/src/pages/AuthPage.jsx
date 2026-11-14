import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Flame, Lock, Mail, User, ShieldCheck, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login({ email: formData.email, password: formData.password });
        // Redirect admins directly to the Admin Dashboard
        if (res.user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate(redirectPath);
        }
      } else {
        await register(formData);
        navigate(redirectPath);
      }
    } catch (err) {
      setErrorMessage(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Demo Login for Customers
  const handleQuickDemo = async (type) => {
    setErrorMessage("");
    setLoading(true);

    try {
      if (type === "admin") {
        navigate("/admin/login");
      } else {
        // Customer demo: try login, if not created yet, register demo user
        try {
          await login({
            email: "customer@demo.com",
            password: "Customer@12345",
          });
          navigate(redirectPath);
        } catch {
          await register({
            name: "Demo Gourmet Customer",
            email: "customer@demo.com",
            password: "Customer@12345",
          });
          navigate(redirectPath);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    try {
      const res = await api.auth.forgotPassword(forgotEmail);
      setSuccessMessage(res.message || "Password reset link has been dispatched to your email.");
      setShowForgotModal(false);
      setForgotEmail("");
    } catch (err) {
      setForgotError(err.message || "Failed to send reset email. Ensure email service is configured.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{ padding: "4rem 0 6rem 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="container" style={{ maxWidth: "460px" }}>
        
        {/* Card */}
        <div className="glass-panel" style={{ padding: "2.5rem 2rem", borderRadius: "20px" }}>
          
          {/* Header Brand */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
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
                boxShadow: "var(--flame-glow)",
              }}
            >
              <Flame size={28} color="#FFF" className="flame-anim" />
            </div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#FFF" }}>
              {isLogin ? "Welcome Back" : "Join the Pizza Kitchen"}
            </h1>
            <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginTop: "4px" }}>
              {isLogin ? "Sign in to access your orders & custom creations" : "Create an account to track deliveries & earn rewards"}
            </p>
          </div>

          {/* Quick Demo Login Buttons */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", textAlign: "center", marginBottom: "8px", fontWeight: 700 }}>
              Quick Evaluator 1-Click Access
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <button
                type="button"
                onClick={() => handleQuickDemo("customer")}
                className="btn-outline btn-sm"
                style={{ fontSize: "0.8rem", padding: "0.5rem" }}
              >
                <User size={14} /> Demo Customer
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/login")}
                style={{
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "var(--gold-primary)",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
              >
                <ShieldCheck size={14} /> Kitchen Admin Portal
              </button>
            </div>
          </div>

          <div style={{ textAlign: "center", position: "relative", margin: "1.5rem 0" }}>
            <div style={{ borderTop: "1px solid var(--border-glass)", position: "absolute", inset: "50% 0 auto 0" }} />
            <span style={{ position: "relative", background: "var(--bg-card)", padding: "0 10px", fontSize: "0.78rem", color: "var(--text-dim)" }}>
              OR SIGN IN MANUALLY
            </span>
          </div>

          {/* Error / Success Messages */}
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
              <CheckCircle size={16} /> {successMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {!isLogin && (
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Your Name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={16} color="var(--text-dim)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    style={{ paddingLeft: "2.4rem" }}
                    placeholder="Mario Rossi"
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="var(--text-dim)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  style={{ paddingLeft: "2.4rem" }}
                  placeholder="chef@pizza.com"
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    style={{ background: "transparent", border: "none", color: "var(--flame-hover)", fontSize: "0.75rem", cursor: "pointer" }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="var(--text-dim)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  style={{ paddingLeft: "2.4rem" }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-flame"
              style={{ marginTop: "0.5rem", padding: "0.85rem", fontSize: "0.98rem" }}
            >
              {loading ? "Authenticating..." : isLogin ? "Sign In to Kitchen" : "Create Account"}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.86rem", color: "var(--text-muted)" }}>
            {isLogin ? "Don't have an account yet?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMessage("");
              }}
              style={{ background: "transparent", border: "none", color: "var(--gold-primary)", fontWeight: 700, cursor: "pointer" }}
            >
              {isLogin ? "Register Now" : "Sign In"}
            </button>
          </div>

        </div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 3000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.75)",
              padding: "1rem",
            }}
          >
            <div className="glass-panel" style={{ width: "100%", maxWidth: "420px", padding: "1.8rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFF", marginBottom: "0.5rem" }}>
                Reset Your Password
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                Enter your registered email address to receive password reset instructions.
              </p>

              {forgotError && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#F87171",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    fontSize: "0.82rem",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>{forgotError}</div>
                </div>
              )}

              <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="input-field"
                  disabled={forgotLoading}
                />
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotError("");
                    }}
                    className="btn-outline"
                    style={{ flex: 1 }}
                    disabled={forgotLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-flame"
                    style={{ flex: 1 }}
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? "Sending Link..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthPage;
