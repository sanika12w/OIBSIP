import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Clock, ChefHat, Bike, CheckCircle2, MapPin, Package, ArrowLeft, AlertCircle, Sparkles } from "lucide-react";
import { api } from "../api";
import { useSocket } from "../context/SocketContext";
import OrderStatusBadge from "../components/OrderStatusBadge";

const OrderTrackPage = () => {
  const { id } = useParams();
  const { socket, joinOrderRoom, isConnected } = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchOrder();

    // Join Socket room for this order
    if (id) {
      joinOrderRoom(id);
    }

    if (socket) {
      socket.on("order_status_updated", (data) => {
        if (data.orderId?.toString() === id?.toString()) {
          console.log("[Socket.IO] Order status updated in real-time:", data.orderStatus);
          setOrder((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              orderStatus: data.orderStatus,
              statusHistory: data.statusHistory || prev.statusHistory,
            };
          });
        }
      });
    }

    // Reliable 5-second polling fallback if WebSockets encounter network delay
    const pollInterval = setInterval(() => {
      if (id) {
        api.orders
          .getById(id)
          .then((res) => {
            if (res.order) {
              setOrder((prev) => {
                if (prev && prev.orderStatus !== res.order.orderStatus) {
                  console.log("[Polling Fallback] Synced status update:", res.order.orderStatus);
                }
                return res.order;
              });
            }
          })
          .catch(() => {});
      }
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      if (socket) {
        socket.off("order_status_updated");
      }
    };
  }, [id, socket]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.orders.getById(id);
      setOrder(res.order);
    } catch (err) {
      setErrorMessage(err.message || "Failed to load order tracking details.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Order Placed",
      desc: "Received & verified",
      icon: Clock,
      statusKey: "Order Placed",
    },
    {
      title: "Baking in Oven",
      desc: "Baking in 450°C wood-fired oven",
      icon: ChefHat,
      statusKey: "Baking in Oven",
    },
    {
      title: "Out for Delivery",
      desc: "Rider on the road",
      icon: Bike,
      statusKey: "Out for Delivery",
    },
    {
      title: "Delivered",
      desc: "Fresh & piping hot",
      icon: CheckCircle2,
      statusKey: "Delivered",
    },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case "Order Placed":
        return 0;
      case "Baking in Oven":
      case "In Kitchen":
        return 1;
      case "Out for Delivery":
        return 2;
      case "Delivered":
        return 3;
      case "Cancelled":
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(order?.orderStatus);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 0", color: "var(--text-muted)" }}>
        <div style={{ fontSize: "2.5rem" }} className="spin-slow">🛵</div>
        <p style={{ marginTop: "1rem" }}>Connecting to live kitchen tracker...</p>
      </div>
    );
  }

  if (errorMessage || !order) {
    return (
      <div style={{ padding: "6rem 0", textAlign: "center" }}>
        <AlertCircle size={48} color="var(--crimson-red)" style={{ margin: "0 auto 1rem auto" }} />
        <h2 style={{ fontSize: "1.6rem", color: "#FFF", marginBottom: "0.5rem" }}>
          Unable to Find Order
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          {errorMessage || "The requested order tracking ID does not exist or access is restricted."}
        </p>
        <Link to="/my-orders" className="btn-flame">
          View All Orders
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "3rem 0 6rem 0" }}>
      <div className="container" style={{ maxWidth: "900px" }}>
        
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <Link
            to="/my-orders"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.88rem" }}
          >
            <ArrowLeft size={16} /> Order History
          </Link>

          {/* Live indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: isConnected ? "var(--herb-green)" : "var(--crimson-red)",
                boxShadow: isConnected ? "0 0 10px var(--herb-green)" : "none",
              }}
            />
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {isConnected ? "Live Tracking Connected" : "Connecting..."}
            </span>
          </div>
        </div>

        {/* Order Header Card */}
        <div className="glass-panel" style={{ padding: "2rem", marginBottom: "2.5rem", borderRadius: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Order #{order._id.slice(-6).toUpperCase()}
              </div>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#FFF", marginTop: "2px" }}>
                Live Order Tracker
              </h1>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Placed on {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>

            <OrderStatusBadge status={order.orderStatus} />
          </div>

          {/* Stepper Progress Bar */}
          <div style={{ padding: "1.5rem 0 1rem 0" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                position: "relative",
                gap: "0.5rem",
              }}
            >
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                const isPassed = currentStep >= index;
                const isCurrent = currentStep === index;

                return (
                  <div
                    key={step.title}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    {/* Circle Icon */}
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: isPassed
                          ? "var(--flame-primary)"
                          : "rgba(255, 255, 255, 0.05)",
                        color: isPassed ? "#FFF" : "var(--text-dim)",
                        border: isCurrent
                          ? "3px solid var(--gold-primary)"
                          : isPassed
                          ? "2px solid var(--flame-primary)"
                          : "1px solid var(--border-glass)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: isCurrent ? "var(--flame-glow)" : "none",
                        transition: "all 0.4s ease",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <IconComponent size={22} className={isCurrent ? "flame-anim" : undefined} />
                    </div>

                    <div style={{ fontWeight: isPassed ? 700 : 500, fontSize: "0.88rem", color: isPassed ? "#FFF" : "var(--text-dim)", lineHeight: 1.2 }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: isCurrent ? "var(--gold-primary)" : "var(--text-muted)", marginTop: "3px" }}>
                      {step.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Details & Items Split */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.8rem" }}>
          
          {/* Left: Items in Order */}
          <div className="glass-panel" style={{ padding: "1.8rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.2rem" }}>
              <Package size={20} color="var(--gold-primary)" />
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFF" }}>
                Pizzas in this Order
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-glass)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#FFF", fontSize: "0.92rem" }}>
                        {item.quantity}x {item.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                        {item.size} • {item.itemType === "custom" ? "Custom Crafted" : "Signature Recipe"}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: "var(--gold-primary)", fontSize: "0.95rem" }}>
                      ₹{item.itemPrice * item.quantity}
                    </div>
                  </div>

                  {item.itemType === "custom" && (
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "6px", lineHeight: 1.4 }}>
                      <div>Crust: {item.base?.name} • Sauce: {item.sauce?.name} • Cheese: {item.cheese?.name}</div>
                      {item.veggies?.length > 0 && (
                        <div>Toppings: {item.veggies.map((v) => v.name).join(", ")}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "1.2rem",
                paddingTop: "0.9rem",
                borderTop: "1px solid var(--border-glass)",
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "#FFF",
              }}
            >
              <span>Total Paid (Razorpay)</span>
              <span style={{ color: "var(--gold-primary)" }}>₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Right: Delivery Address & Real-time History */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Delivery Destination */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
                <MapPin size={18} color="var(--flame-primary)" />
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#FFF" }}>
                  Delivery Destination
                </h4>
              </div>

              <div style={{ fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                <div style={{ fontWeight: 700, color: "#FFF" }}>{order.deliveryAddress?.fullName}</div>
                <div>{order.deliveryAddress?.street}</div>
                <div>{order.deliveryAddress?.city}, {order.deliveryAddress?.zipCode}</div>
                <div style={{ marginTop: "4px", color: "var(--gold-primary)" }}>
                  Phone: {order.deliveryAddress?.phone}
                </div>
              </div>
            </div>

            {/* Status Event Timeline */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#FFF", marginBottom: "0.8rem" }}>
                Kitchen & Delivery Timeline
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                {order.statusHistory?.map((hist, hIdx) => (
                  <div
                    key={hIdx}
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "flex-start",
                      fontSize: "0.82rem",
                    }}
                  >
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--flame-primary)", marginTop: "6px" }} />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 700, color: "#FFF" }}>{hist.status}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{hist.note}</div>
                      <div style={{ color: "var(--text-dim)", fontSize: "0.7rem", marginTop: "2px" }}>
                        {new Date(hist.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderTrackPage;
