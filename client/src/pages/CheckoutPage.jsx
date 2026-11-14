import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, MapPin, Phone, User, CreditCard, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import RazorpayModal from "../components/RazorpayModal";

const CheckoutPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, subtotal, deliveryFee, tax, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "9876543210",
    street: user?.address?.street || "42 Baker's Stone Boulevard",
    city: user?.address?.city || "Mumbai",
    state: user?.address?.state || "Maharashtra",
    zipCode: user?.address?.zipCode || "400001",
    instructions: "Leave at door and ring bell.",
  });

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Modal State for local test sandbox fallback
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [pendingOrderDetails, setPendingOrderDetails] = useState(null);

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: "6rem 0", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</div>
        <h2 style={{ fontSize: "1.8rem", color: "#FFF", marginBottom: "0.5rem" }}>
          Your Cart is Empty
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Add our signature pizzas or design your own to proceed with checkout.
        </p>
        <Link to="/menu" className="btn-flame">
          Browse Menu
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      setLoading(true);

      // Verify payment signature strictly on the server and atomically deduct inventory
      const verifyRes = await api.payments.verifyPayment(paymentData);

      if (verifyRes.success) {
        setIsRazorpayModalOpen(false);

        // Celebration confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Clear local cart
        clearCart();

        // Redirect to live order tracking page
        navigate(`/track/${paymentData.orderId}`);
      }
    } catch (err) {
      setErrorMessage(`Payment verification failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateOrder = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.fullName || !formData.phone || !formData.street || !formData.city || !formData.zipCode) {
      setErrorMessage("Please complete all required delivery fields.");
      return;
    }

    try {
      setLoading(true);

      // 1. Format order items for backend
      const formattedItems = cartItems.map((item) => ({
        itemType: item.itemType || "preset",
        pizza: item.pizzaId || null,
        name: item.name,
        size: item.size || "Regular",
        base: item.base || { name: "", price: 0 },
        sauce: item.sauce || { name: "", price: 0 },
        cheese: item.cheese || { name: "", price: 0 },
        veggies: item.veggies || [],
        quantity: item.quantity,
        itemPrice: item.itemPrice || item.price,
      }));

      // 2. Create pending order in database
      const orderRes = await api.orders.create({
        items: formattedItems,
        deliveryAddress: formData,
        paymentMethod,
      });

      const order = orderRes.order;

      // 3. Initiate payment order
      const paymentOrderRes = await api.payments.createPaymentOrder(order._id);

      setPendingOrderDetails({
        orderId: order._id,
        razorpayOrderId: paymentOrderRes.razorpayOrderId,
        totalAmount: order.totalAmount,
      });

      // 4. Check if official Razorpay Checkout SDK is available in window
      if (
        typeof window !== "undefined" &&
        window.Razorpay &&
        paymentOrderRes.keyId &&
        !paymentOrderRes.keyId.includes("placeholder") &&
        !paymentOrderRes.razorpayOrderId.startsWith("order_test_")
      ) {
        // Open Official Razorpay Checkout Modal
        const options = {
          key: paymentOrderRes.keyId,
          amount: paymentOrderRes.amount,
          currency: paymentOrderRes.currency || "INR",
          name: "Fuego & Forno Artisan Pizza",
          description: `Order #${order._id.slice(-6).toUpperCase()}`,
          order_id: paymentOrderRes.razorpayOrderId,
          handler: async function (response) {
            await handlePaymentSuccess({
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
          prefill: {
            name: formData.fullName,
            email: user?.email || "customer@example.com",
            contact: formData.phone,
          },
          theme: {
            color: "#E64A19",
          },
          modal: {
            ondismiss: async function () {
              setErrorMessage("Payment was dismissed. Your order remains pending.");
              await fetch("/api/payments/cancel", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("pizza_token")}`,
                },
                body: JSON.stringify({ orderId: order._id }),
              }).catch(() => {});
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", async function (response) {
          setErrorMessage(`Payment Rejected by Gateway: ${response.error?.description || "Failed"}`);
          await fetch("/api/payments/fail", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("pizza_token")}`,
            },
            body: JSON.stringify({
              orderId: order._id,
              errorDescription: response.error?.description,
            }),
          }).catch(() => {});
        });

        rzp.open();
      } else {
        // Test environment / placeholder fallback: Open test sandbox modal
        setIsRazorpayModalOpen(true);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to initiate order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "3rem 0 6rem 0" }}>
      <div className="container" style={{ maxWidth: "1050px" }}>
        
        {/* Back button */}
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
          Delivery & Payment
        </h1>

        {errorMessage && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              color: "#F87171",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              padding: "1rem",
              borderRadius: "10px",
              marginBottom: "1.8rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <AlertCircle size={20} />
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleInitiateOrder}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2rem",
            }}
          >
            {/* Left: Delivery Details */}
            <div className="glass-panel" style={{ padding: "1.8rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.4rem" }}>
                <MapPin size={22} color="var(--flame-primary)" />
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#FFF" }}>
                  Delivery Address
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Phone Number (for Rider updates) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Street Address / Apartment *
                  </label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem" }}>
                  <div>
                    <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                      Postal Code / PIN *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    placeholder="e.g. Ring doorbell, leave on table"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Right: Order Summary & Payment Gateway */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              
              {/* Order Items Review */}
              <div className="glass-panel" style={{ padding: "1.8rem" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFF", marginBottom: "1rem" }}>
                  Order Summary ({cartItems.length} items)
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "240px", overflowY: "auto", marginBottom: "1.2rem" }}>
                  {cartItems.map((item) => (
                    <div
                      key={item.cartId}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.88rem",
                        paddingBottom: "0.5rem",
                        borderBottom: "1px solid var(--border-glass)",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: "#FFF" }}>
                          {item.quantity}x {item.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                          {item.size} {item.itemType === "custom" && "• Custom Pizza"}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: "var(--gold-primary)" }}>
                        ₹{(item.itemPrice || item.price) * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculation Lines */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <strong style={{ color: "var(--herb-green)" }}>FREE</strong> : `₹${deliveryFee}`}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                  <span>GST (5%)</span>
                  <span>₹{tax}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "#FFF",
                    borderTop: "1px solid var(--border-glass)",
                    paddingTop: "0.75rem",
                  }}
                >
                  <span>Grand Total</span>
                  <span style={{ color: "var(--gold-primary)" }}>₹{totalAmount}</span>
                </div>
              </div>

              {/* Payment Gateway Box */}
              <div className="glass-panel" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <ShieldCheck size={20} color="var(--blue-info)" />
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#FFF" }}>
                    Payment Method
                  </h3>
                </div>

                <div
                  style={{
                    padding: "0.85rem",
                    borderRadius: "10px",
                    background: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.2rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ background: "#0284C7", color: "#FFF", width: "24px", height: "24px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.85rem" }}>
                      R
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#FFF" }}>
                        Razorpay Secure Gateway
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#93C5FD" }}>
                        Cards, UPI, NetBanking • HMAC-SHA256 Verified
                      </div>
                    </div>
                  </div>
                  <Lock size={16} color="#60A5FA" />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-flame"
                  style={{ width: "100%", padding: "0.95rem", fontSize: "1.05rem", borderRadius: "10px" }}
                >
                  {loading ? "Preparing Order..." : `Pay ₹${totalAmount} & Place Order`}
                </button>
              </div>

            </div>
          </div>
        </form>

        {/* Razorpay Modal */}
        <RazorpayModal
          isOpen={isRazorpayModalOpen}
          onClose={() => setIsRazorpayModalOpen(false)}
          orderDetails={pendingOrderDetails}
          onPaymentSuccess={handlePaymentSuccess}
        />

      </div>
    </div>
  );
};

export default CheckoutPage;
