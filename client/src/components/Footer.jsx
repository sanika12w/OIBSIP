import React from "react";
import { Flame, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-glass)",
        backgroundColor: "rgba(11, 11, 14, 0.95)",
        padding: "3.5rem 0 2rem 0",
        color: "var(--text-muted)",
        fontSize: "0.88rem",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2.5rem",
            marginBottom: "3rem",
          }}
        >
          {/* Brand Col */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "var(--flame-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Flame size={18} color="#FFF" />
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#FFF" }}>
                FUEGO & FORNO
              </span>
            </div>
            <p style={{ lineHeight: 1.6, color: "var(--text-secondary)", fontSize: "0.84rem" }}>
              Authentic wood-fired Neapolitan pizza, hand-tossed dough fermented for 48 hours, and custom layering made for true pizza connoisseurs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{ fontWeight: 700, color: "#FFF", marginBottom: "0.8rem", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.05em" }}>
              Kitchen Menu
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li><Link to="/menu" style={{ color: "var(--text-secondary)" }}>Signature Pizzas</Link></li>
              <li><Link to="/builder" style={{ color: "var(--text-secondary)" }}>Custom Pizza Visualizer</Link></li>
              <li><Link to="/my-orders" style={{ color: "var(--text-secondary)" }}>Live Order Tracking</Link></li>
            </ul>
          </div>

          {/* Kitchen Hours */}
          <div>
            <div style={{ fontWeight: 700, color: "#FFF", marginBottom: "0.8rem", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.05em" }}>
              Oven Hours
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", color: "var(--text-secondary)", fontSize: "0.84rem" }}>
              <div>Monday – Thursday: 11:00 AM – 11:00 PM</div>
              <div>Friday – Sunday: 11:00 AM – 1:00 AM</div>
              <div style={{ color: "var(--gold-primary)", marginTop: "4px" }}>Wood-Fired Ovens Always Hot 🔥</div>
            </div>
          </div>

          {/* Internship Attributions */}
          <div>
            <div style={{ fontWeight: 700, color: "#FFF", marginBottom: "0.8rem", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.05em" }}>
              Project Context
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", lineHeight: 1.5 }}>
              Developed as part of the <strong>OIBSIP Level 3</strong> Web Development & Designing Internship. Complete full-stack MERN with Razorpay and Socket.IO.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid var(--border-glass)",
            paddingTop: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            fontSize: "0.78rem",
            color: "var(--text-dim)",
          }}
        >
          <div>
            © {new Date().getFullYear()} Fuego & Forno Artisan Pizza Kitchen. All rights reserved. •{" "}
            <Link to="/admin/login" style={{ color: "var(--gold-primary)", fontWeight: 600 }}>
              Staff / Admin Portal
            </Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            Handcrafted with <Heart size={13} color="var(--crimson-red)" /> on MERN Stack
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
