import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";

const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    tax,
    totalAmount,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: "6rem 0", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</div>
        <h2 style={{ fontSize: "1.8rem", color: "#FFF", marginBottom: "0.5rem" }}>
          Your Cart is Empty
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Craft a custom pizza or select from our wood-fired specialties.
        </p>
        <Link to="/menu" className="btn-flame">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "3rem 0 6rem 0" }}>
      <div className="container" style={{ maxWidth: "960px" }}>
        
        {/* Back link */}
        <Link
          to="/menu"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--text-muted)",
            fontSize: "0.88rem",
            marginBottom: "1.8rem",
          }}
        >
          <ArrowLeft size={16} /> Continue Shopping
        </Link>

        <h1 style={{ fontSize: "2.3rem", fontWeight: 800, color: "#FFF", marginBottom: "2rem" }}>
          Your Feast Cart ({cartItems.length} items)
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", alignItems: "start" }}>
          
          {/* Cart items list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {cartItems.map((item) => (
              <div
                key={item.cartId}
                className="glass-panel"
                style={{ padding: "1.25rem", borderRadius: "14px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFF" }}>{item.name}</h3>
                    <div style={{ fontSize: "0.8rem", color: "var(--gold-primary)", marginTop: "2px" }}>
                      {item.size || "Regular"} Size {item.itemType === "custom" && "• Custom Pizza"}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.cartId)}
                    style={{ background: "transparent", color: "var(--text-dim)", cursor: "pointer", padding: "4px" }}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {item.itemType === "custom" && (
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      background: "rgba(0,0,0,0.25)",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "6px",
                      marginBottom: "0.8rem",
                      lineHeight: 1.5,
                    }}
                  >
                    <div><strong>Crust:</strong> {item.base?.name} | <strong>Sauce:</strong> {item.sauce?.name} | <strong>Cheese:</strong> {item.cheese?.name}</div>
                    {item.veggies?.length > 0 && (
                      <div><strong>Toppings:</strong> {item.veggies.map((v) => v.name).join(", ")}</div>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-glass)", paddingTop: "0.75rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      background: "rgba(0, 0, 0, 0.3)",
                      borderRadius: "6px",
                      padding: "2px 8px",
                      border: "1px solid var(--border-glass)",
                    }}
                  >
                    <button
                      onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                      style={{ background: "transparent", color: "#FFF", cursor: "pointer", padding: "2px" }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, minWidth: "18px", textAlign: "center" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                      style={{ background: "transparent", color: "#FFF", cursor: "pointer", padding: "2px" }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div style={{ fontWeight: 800, color: "var(--gold-primary)", fontSize: "1.1rem" }}>
                    ₹{(item.itemPrice || item.price) * item.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Card */}
          <div className="glass-panel" style={{ padding: "1.8rem", borderRadius: "18px", position: "sticky", top: "100px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFF", marginBottom: "1.2rem" }}>
              Order Breakdown
            </h3>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "6px" }}>
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "6px" }}>
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? <strong style={{ color: "var(--herb-green)" }}>FREE</strong> : `₹${deliveryFee}`}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "12px" }}>
              <span>GST (5%)</span>
              <span>₹{tax}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.3rem",
                fontWeight: 800,
                color: "#FFF",
                borderTop: "1px solid var(--border-glass)",
                paddingTop: "0.8rem",
                marginBottom: "1.5rem",
              }}
            >
              <span>Total Amount</span>
              <span style={{ color: "var(--gold-primary)" }}>₹{totalAmount}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="btn-flame"
              style={{ width: "100%", padding: "0.95rem", fontSize: "1.02rem", borderRadius: "10px" }}
            >
              Proceed to Delivery & Payment <ArrowRight size={18} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CartPage;
