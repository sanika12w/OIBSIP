import React from "react";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CartDrawer = () => {
  const {
    cartItems,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    tax,
    totalAmount,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleCheckoutClick = () => {
    setIsDrawerOpen(false);
    navigate("/checkout");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop overlay */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />

      {/* Drawer content */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "420px",
          height: "100%",
          backgroundColor: "var(--bg-card)",
          borderLeft: "1px solid var(--border-glass-bright)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-10px 0 35px rgba(0, 0, 0, 0.7)",
          zIndex: 1001,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border-glass)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <ShoppingBag size={20} color="var(--flame-primary)" />
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFF" }}>
              Your Feast Cart
            </h2>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "0.4rem",
              borderRadius: "50%",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Item List */}
        <div style={{ flexGrow: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.8rem" }}>🍕</div>
              <p style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Your cart is currently empty
              </p>
              <p style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                Craft a custom pizza or select from our wood-fired specialties.
              </p>
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  navigate("/menu");
                }}
                className="btn-flame"
                style={{ fontSize: "0.88rem", padding: "0.6rem 1.2rem" }}
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {cartItems.map((item) => (
                <div
                  key={item.cartId}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.9rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#FFF", fontSize: "0.95rem" }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--gold-primary)", marginTop: "2px" }}>
                        {item.size || "Regular"} Size {item.itemType === "custom" && "• Custom Pizza"}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      style={{
                        background: "transparent",
                        color: "var(--text-dim)",
                        cursor: "pointer",
                        padding: "2px",
                      }}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Customization Details */}
                  {item.itemType === "custom" && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        background: "rgba(0, 0, 0, 0.25)",
                        padding: "0.4rem 0.6rem",
                        borderRadius: "4px",
                        lineHeight: 1.4,
                      }}
                    >
                      <div><strong>Crust:</strong> {item.base?.name || "Standard"}</div>
                      <div><strong>Sauce:</strong> {item.sauce?.name || "Standard"}</div>
                      <div><strong>Cheese:</strong> {item.cheese?.name || "Standard"}</div>
                      {item.veggies && item.veggies.length > 0 && (
                        <div><strong>Toppings:</strong> {item.veggies.map((v) => v.name).join(", ")}</div>
                      )}
                    </div>
                  )}

                  {/* Quantity & Subtotal */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "0.3rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "rgba(0, 0, 0, 0.3)",
                        borderRadius: "6px",
                        padding: "2px 6px",
                        border: "1px solid var(--border-glass)",
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        style={{ background: "transparent", color: "#FFF", cursor: "pointer", padding: "2px" }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, minWidth: "16px", textAlign: "center" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        style={{ background: "transparent", color: "#FFF", cursor: "pointer", padding: "2px" }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div style={{ fontWeight: 800, color: "var(--gold-primary)", fontSize: "0.95rem" }}>
                      ₹{(item.itemPrice || item.price) * item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cartItems.length > 0 && (
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderTop: "1px solid var(--border-glass)",
              background: "rgba(11, 11, 14, 0.95)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: "0.4rem", color: "var(--text-muted)" }}>
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: "0.4rem", color: "var(--text-muted)" }}>
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? <strong style={{ color: "var(--herb-green)" }}>FREE</strong> : `₹${deliveryFee}`}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: "0.8rem", color: "var(--text-muted)" }}>
              <span>Estimated Taxes (5% GST)</span>
              <span>₹{tax}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.15rem",
                fontWeight: 800,
                color: "#FFF",
                borderTop: "1px solid var(--border-glass)",
                paddingTop: "0.6rem",
                marginBottom: "1.2rem",
              }}
            >
              <span>Total Amount</span>
              <span style={{ color: "var(--gold-primary)" }}>₹{totalAmount}</span>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="btn-flame"
              style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", borderRadius: "10px" }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
