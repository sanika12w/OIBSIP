import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Flame, ShoppingBag, User, LogOut, ShieldCheck, Clock, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, setIsDrawerOpen } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      backgroundColor: "rgba(11, 11, 14, 0.85)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      borderBottom: "1px solid var(--border-glass)",
      padding: "0.85rem 0",
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "var(--flame-gradient)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--flame-glow)",
          }}>
            <Flame size={24} color="#FFF" className="flame-anim" />
          </div>
          <div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.28rem",
              fontWeight: 800,
              letterSpacing: "0.04em",
              color: "#FFF",
              lineHeight: 1.1,
            }}>
              FUEGO & FORNO
            </div>
            <div style={{
              fontSize: "0.68rem",
              letterSpacing: "0.18em",
              color: "var(--gold-primary)",
              textTransform: "uppercase",
              fontWeight: 600,
            }}>
              Artisan Pizza Kitchen
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "1.8rem" }}>
          <Link
            to="/menu"
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: isActive("/menu") ? "var(--flame-primary)" : "var(--text-secondary)",
              transition: "color var(--transition-fast)",
            }}
          >
            Menu Catalog
          </Link>

          <Link
            to="/builder"
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: isActive("/builder") ? "var(--gold-primary)" : "var(--text-secondary)",
              transition: "color var(--transition-fast)",
            }}
          >
            <Sparkles size={16} color="var(--gold-primary)" />
            Custom Pizza Builder
          </Link>

          {isAuthenticated && (
            <Link
              to="/my-orders"
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: isActive("/my-orders") ? "var(--flame-primary)" : "var(--text-secondary)",
                transition: "color var(--transition-fast)",
              }}
            >
              My Orders
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                background: "rgba(245, 158, 11, 0.15)",
                color: "var(--gold-primary)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
                padding: "0.35rem 0.8rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.82rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <ShieldCheck size={15} />
              Kitchen Admin
            </Link>
          )}
        </nav>

        {/* Action Controls: Cart & Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          
          {/* Cart Trigger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            style={{
              position: "relative",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-glass-bright)",
              color: "#FFF",
              padding: "0.55rem 0.95rem",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
            aria-label="View Cart"
          >
            <ShoppingBag size={18} color="var(--flame-primary)" />
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Cart</span>
            {itemCount > 0 && (
              <span
                style={{
                  background: "var(--flame-gradient)",
                  color: "#FFF",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "var(--flame-glow)",
                }}
              >
                {itemCount}
              </span>
            )}
          </button>

          {/* User Account */}
          {isAuthenticated ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-glass)",
                  color: "#FFF",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                }}
              >
                <div style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  background: "var(--flame-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span style={{ fontSize: "0.88rem", fontWeight: 600, maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name?.split(" ")[0]}
                </span>
              </button>

              {dropdownOpen && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-glass-bright)",
                  borderRadius: "var(--radius-sm)",
                  minWidth: "180px",
                  padding: "0.5rem 0",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  zIndex: 200,
                }}>
                  <div style={{ padding: "0.5rem 1rem", borderBottom: "1px solid var(--border-glass)" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FFF" }}>{user?.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</div>
                  </div>

                  <Link
                    to="/my-orders"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.6rem 1rem",
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Clock size={15} /> Order History
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.6rem 1rem",
                        fontSize: "0.85rem",
                        color: "var(--gold-primary)",
                      }}
                    >
                      <ShieldCheck size={15} /> Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.6rem 1rem",
                      fontSize: "0.85rem",
                      color: "var(--crimson-red)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      borderTop: "1px solid var(--border-glass)",
                    }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="btn-flame" style={{ padding: "0.5rem 1.1rem", fontSize: "0.88rem" }}>
              <User size={16} /> Sign In
            </Link>
          )}

        </div>
      </div>
    </header>
  );
};

export default Navbar;
