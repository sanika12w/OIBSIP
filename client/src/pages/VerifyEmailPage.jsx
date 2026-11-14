import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, ArrowRight, Flame } from "lucide-react";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    fetch(`/api/auth/verify-email/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Your email has been successfully verified!");
        } else {
          setStatus("error");
          setMessage(data.message || "Invalid or expired verification token.");
        }
      })
      .catch((err) => {
        setStatus("error");
        setMessage("Verification network error. Please try again.");
      });
  }, [token]);

  return (
    <div style={{ padding: "6rem 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="container" style={{ maxWidth: "460px" }}>
        <div className="glass-panel" style={{ padding: "3rem 2rem", textAlign: "center", borderRadius: "20px" }}>
          
          {status === "verifying" && (
            <div>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }} className="spin-slow">🍕</div>
              <h2 style={{ fontSize: "1.5rem", color: "#FFF", marginBottom: "0.5rem" }}>
                Verifying Email Address...
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                Authenticating your account with our kitchen registry.
              </p>
            </div>
          )}

          {status === "success" && (
            <div>
              <CheckCircle2 size={54} color="var(--herb-green)" style={{ margin: "0 auto 1.2rem auto" }} />
              <h2 style={{ fontSize: "1.7rem", fontWeight: 800, color: "#FFF", marginBottom: "0.5rem" }}>
                Email Verified!
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginBottom: "2rem" }}>
                {message}
              </p>
              <Link to="/menu" className="btn-flame" style={{ padding: "0.85rem 1.6rem" }}>
                Browse Pizzas <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {status === "error" && (
            <div>
              <AlertCircle size={54} color="var(--crimson-red)" style={{ margin: "0 auto 1.2rem auto" }} />
              <h2 style={{ fontSize: "1.7rem", fontWeight: 800, color: "#FFF", marginBottom: "0.5rem" }}>
                Verification Failed
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginBottom: "2rem" }}>
                {message}
              </p>
              <Link to="/auth" className="btn-outline" style={{ padding: "0.85rem 1.6rem" }}>
                Return to Sign In
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
