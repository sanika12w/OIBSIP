import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, Package, ShoppingBag } from "lucide-react";
import { api } from "../api";
import OrderStatusBadge from "../components/OrderStatusBadge";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.orders
      .getMyOrders()
      .then((data) => setOrders(data.orders || []))
      .catch((err) => console.error("Failed to load my orders:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "3rem 0 6rem 0" }}>
      <div className="container" style={{ maxWidth: "900px" }}>
        
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.3rem", fontWeight: 800, color: "#FFF", marginBottom: "0.4rem" }}>
            My Order History
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Review past orders, view invoices, or track active wood-fired oven pizzas.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "2rem" }} className="spin-slow">🍕</div>
            <p style={{ marginTop: "1rem" }}>Retrieving past orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <ShoppingBag size={48} color="var(--text-dim)" style={{ margin: "0 auto 1rem auto" }} />
            <h3 style={{ fontSize: "1.3rem", color: "#FFF", marginBottom: "0.5rem" }}>
              No orders placed yet
            </h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              Ready for a fresh, authentic slice? Browse our menu or create a custom pizza.
            </p>
            <Link to="/menu" className="btn-flame">
              Explore Menu
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {orders.map((order) => (
              <div
                key={order._id}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: "1.5rem",
                  borderRadius: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.8rem" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>
                      Order #{order._id.slice(-6).toUpperCase()}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    <OrderStatusBadge status={order.orderStatus} />
                    <Link
                      to={`/track/${order._id}`}
                      className="btn-outline btn-sm"
                      style={{ fontSize: "0.82rem", padding: "0.4rem 0.8rem" }}
                    >
                      Track Order <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Items Summary */}
                <div
                  style={{
                    padding: "0.85rem",
                    borderRadius: "8px",
                    background: "rgba(0, 0, 0, 0.25)",
                    border: "1px solid var(--border-glass)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                        <span style={{ color: "var(--text-secondary)" }}>
                          <strong>{item.quantity}x</strong> {item.name} ({item.size})
                        </span>
                        <span style={{ color: "var(--gold-primary)", fontWeight: 600 }}>
                          ₹{item.itemPrice * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Total */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-glass)", paddingTop: "0.75rem" }}>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    Payment: <strong style={{ color: "#FFF" }}>{order.paymentInfo?.method?.toUpperCase() || "RAZORPAY"}</strong> ({order.paymentInfo?.status})
                  </div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--gold-primary)" }}>
                    Total: ₹{order.totalAmount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyOrdersPage;
