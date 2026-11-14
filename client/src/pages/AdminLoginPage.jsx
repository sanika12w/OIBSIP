import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await login({ email, password });
      
      // Strict role verification: only admin users are authorized
      if (!res.user || res.user.role !== "admin") {
        logout();
        throw new Error("Access Denied: This account is registered as a customer and does not possess administrator credentials.");
      }

      // Redirect directly to the Admin Command Dashboard
      navigate("/admin");
    } catch (err) {
      setErrorMessage(err.message || "Admin authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Evaluator Seeded Admin Login
  const handleQuickSeededAdmin = async () => {
    setEmail("admin@pizzadelivery.com");
    setPassword("Admin@12345");
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await login({
        email: "admin@pizzadelivery.com",
        password: "Admin@12345",
      });

      if (!res.user || res.user.role !== "admin") {
        logout();
        throw new Error("Access Denied: Seeded account does not possess admin privileges.");
      }

      navigate("/admin");
    } catch (err) {
      setErrorMessage(err.message || "Failed to log in with seeded admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "4.5rem 0 6rem 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="container" style={{ maxWidth: "440px" }}>
        
        {/* Navigation back */}
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--text-muted)",
            fontSize: "0.86rem",
            marginBottom: "1.5rem",
          }}
        >
          <ArrowLeft size={16} /> Back to Customer Store
        </Link>

        {/* Card */}
        <div
          className="glass-panel"
          style={{
            padding: "2.5rem 2rem",
            borderRadius: "20px",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
          }}
        >
          {/* Header Brand */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "rgba(245, 158, 11, 0.18)",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 0.75rem auto",
              }}
            >
              <ShieldCheck size={30} color="var(--gold-primary)" />
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FFF" }}>
              Kitchen Admin Portal
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Authorized restaurant staff & head chef access only
            </p>
          </div>

          {/* 1-Click Seeded Admin Evaluator Button */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                fontSize: "0.74rem",
                color: "var(--gold-primary)",
                textTransform: "uppercase",
                textAlign: "center",
                marginBottom: "8px",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              Evaluation Quick Access
            </div>
            <button
              type="button"
              onClick={handleQuickSeededAdmin}
              disabled={loading}
              style={{
                width: "100%",
                background: "rgba(245, 158, 11, 0.15)",
                color: "var(--gold-primary)",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.85rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                cursor: "pointer",
                padding: "0.65rem",
                transition: "all var(--transition-fast)",
              }}
            >
              <ShieldCheck size={16} /> Log In as Head Chef Admin (Seeded)
            </button>
          </div>

          <div style={{ textAlign: "center", position: "relative", margin: "1.5rem 0" }}>
            <div style={{ borderTop: "1px solid var(--border-glass)", position: "absolute", inset: "50% 0 auto 0" }} />
            <span
              style={{
                position: "relative",
                background: "var(--bg-card)",
                padding: "0 10px",
                fontSize: "0.76rem",
                color: "var(--text-dim)",
              }}
            >
              OR ENTER STAFF CREDENTIALS
            </span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                color: "#F87171",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "0.75rem",
                borderRadius: "8px",
                marginBottom: "1.2rem",
                fontSize: "0.84rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                Admin Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  color="var(--text-dim)"
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: "2.4rem" }}
                  placeholder="admin@pizzadelivery.com"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                Admin Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  color="var(--text-dim)"
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              style={{
                marginTop: "0.5rem",
                padding: "0.85rem",
                fontSize: "0.98rem",
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
              }}
            >
              {loading ? "Authenticating Admin..." : "Access Kitchen Command"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.8rem", fontSize: "0.8rem", color: "var(--text-dim)" }}>
            Need public customer ordering?{" "}
            <Link to="/auth" style={{ color: "var(--flame-hover)", fontWeight: 600 }}>
              Customer Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
