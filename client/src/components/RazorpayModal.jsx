import React, { useState } from "react";
import { ShieldCheck, CreditCard, Smartphone, CheckCircle, AlertTriangle, X, Lock } from "lucide-react";

const RazorpayModal = ({ isOpen, onClose, orderDetails, onPaymentSuccess }) => {
  const [activeTab, setActiveTab] = useState("card"); // 'card' | 'upi'
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("888");
  const [upiId, setUpiId] = useState("customer@oksbi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  // Compute authentic HMAC-SHA256 signature in browser
  const computeHmacSha256 = async (message, secretKey) => {
    const enc = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(secretKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await window.crypto.subtle.sign(
      "HMAC",
      key,
      enc.encode(message)
    );
    return Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const handleSimulatedPay = async () => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      // Simulate Razorpay gateway transaction processing
      await new Promise((res) => setTimeout(res, 1000));

      const simulatedPaymentId = `pay_test_${Math.random().toString(36).substring(2, 10)}`;
      const simulatedOrderId = orderDetails?.razorpayOrderId || `order_test_${Date.now()}`;
      const secret = "dev_test_secret_998877";

      // Compute genuine HMAC SHA-256 signature
      const validSignature = await computeHmacSha256(
        `${simulatedOrderId}|${simulatedPaymentId}`,
        secret
      );

      onPaymentSuccess({
        orderId: orderDetails?.orderId,
        razorpayOrderId: simulatedOrderId,
        razorpayPaymentId: simulatedPaymentId,
        razorpaySignature: validSignature,
      });
    } catch (err) {
      setErrorMessage(err.message || "Payment simulation failed.");
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#0F172A",
          border: "1px solid #1E293B",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          overflow: "hidden",
          color: "#F8FAFC",
        }}
      >
        {/* Razorpay Branded Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
            padding: "1.25rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                background: "#FFF",
                color: "#0284C7",
                fontWeight: 900,
                fontSize: "1.1rem",
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                letterSpacing: "-0.05em",
              }}
            >
              R
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "0.02em" }}>
                Razorpay Test Sandbox
              </div>
              <div style={{ fontSize: "0.72rem", color: "#E0F2FE", display: "flex", alignItems: "center", gap: "4px" }}>
                <Lock size={11} /> Cryptographic HMAC-SHA256 Verification Enabled
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "#FFF",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "50%",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Order Amount Bar */}
        <div
          style={{
            backgroundColor: "#1E293B",
            padding: "0.9rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #334155",
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>Payable Total</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#38BDF8" }}>
              ₹{orderDetails?.totalAmount || 0}
            </div>
          </div>
          <div
            style={{
              background: "rgba(56, 189, 248, 0.12)",
              color: "#38BDF8",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              padding: "0.2rem 0.6rem",
              borderRadius: "4px",
              fontSize: "0.72rem",
              fontWeight: 700,
            }}
          >
            TEST ENVIRONMENT
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #334155" }}>
          <button
            onClick={() => setActiveTab("card")}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: activeTab === "card" ? "#0F172A" : "#1E293B",
              color: activeTab === "card" ? "#38BDF8" : "#94A3B8",
              fontWeight: 600,
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              borderBottom: activeTab === "card" ? "2px solid #38BDF8" : "none",
            }}
          >
            <CreditCard size={16} /> Credit / Debit Card
          </button>
          <button
            onClick={() => setActiveTab("upi")}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: activeTab === "upi" ? "#0F172A" : "#1E293B",
              color: activeTab === "upi" ? "#38BDF8" : "#94A3B8",
              fontWeight: 600,
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              borderBottom: activeTab === "upi" ? "2px solid #38BDF8" : "none",
            }}
          >
            <Smartphone size={16} /> UPI / QR
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: "1.25rem 1.5rem" }}>
          {errorMessage && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                color: "#F87171",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "0.6rem 0.8rem",
                borderRadius: "6px",
                fontSize: "0.82rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <AlertTriangle size={15} /> {errorMessage}
            </div>
          )}

          {activeTab === "card" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "#94A3B8", display: "block", marginBottom: "4px" }}>
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                    padding: "0.65rem 0.85rem",
                    color: "#F8FAFC",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.75rem", color: "#94A3B8", display: "block", marginBottom: "4px" }}>
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#1E293B",
                      border: "1px solid #334155",
                      borderRadius: "6px",
                      padding: "0.65rem 0.85rem",
                      color: "#F8FAFC",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.75rem", color: "#94A3B8", display: "block", marginBottom: "4px" }}>
                    CVV
                  </label>
                  <input
                    type="password"
                    value={cardCvv}
                    maxLength={4}
                    onChange={(e) => setCardCvv(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#1E293B",
                      border: "1px solid #334155",
                      borderRadius: "6px",
                      padding: "0.65rem 0.85rem",
                      color: "#F8FAFC",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: "0.75rem", color: "#94A3B8", display: "block", marginBottom: "4px" }}>
                Virtual Payment Address (UPI ID)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@okhdfcbank"
                style={{
                  width: "100%",
                  background: "#1E293B",
                  border: "1px solid #334155",
                  borderRadius: "6px",
                  padding: "0.65rem 0.85rem",
                  color: "#F8FAFC",
                  fontSize: "0.9rem",
                  marginBottom: "0.8rem",
                }}
              />
              <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
                Supported apps: Google Pay, PhonePe, Paytm, BHIM, Cred
              </div>
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handleSimulatedPay}
            disabled={isProcessing}
            style={{
              width: "100%",
              marginTop: "1.25rem",
              background: isProcessing ? "#0369A1" : "#0284C7",
              color: "#FFF",
              fontWeight: 700,
              fontSize: "0.95rem",
              padding: "0.85rem",
              borderRadius: "8px",
              cursor: isProcessing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "background 0.2s ease",
            }}
          >
            {isProcessing ? (
              <>
                <span className="spin-slow">⏳</span> Authorizing Payment...
              </>
            ) : (
              <>
                <CheckCircle size={18} /> Pay ₹{orderDetails?.totalAmount || 0}
              </>
            )}
          </button>

          <div
            style={{
              marginTop: "0.85rem",
              textAlign: "center",
              fontSize: "0.72rem",
              color: "#64748B",
            }}
          >
            Submits cryptographically valid HMAC-SHA256 signature to backend
          </div>
        </div>
      </div>
    </div>
  );
};

export default RazorpayModal;
