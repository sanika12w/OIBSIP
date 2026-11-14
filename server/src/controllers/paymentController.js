import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import { deductOrderInventory } from "./orderController.js";
import { emitNewOrderToAdmin, emitOrderStatusUpdate } from "../utils/socket.js";

// Initialize Razorpay SDK instance
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret || key_id.includes("placeholder")) {
    return null;
  }

  return new Razorpay({ key_id, key_secret });
};

// Return public payment configurations
export const getPaymentConfig = (req, res) => {
  res.status(200).json({
    success: true,
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_5173PizzaDevKey",
    currency: "INR",
  });
};

// Create Razorpay payment order
export const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required to initiate payment",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(order.totalAmount * 100);
    const razorpay = getRazorpayInstance();

    let razorpayOrderId = "";

    if (razorpay) {
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_${order._id.toString().slice(-8)}`,
          notes: {
            orderId: order._id.toString(),
            customerEmail: req.user.email,
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr) {
        console.warn("Razorpay API call failed, switching to local test order:", rzpErr.message);
        razorpayOrderId = `order_test_${Date.now()}`;
      }
    } else {
      // Local test simulation order
      razorpayOrderId = `order_test_${Date.now()}`;
    }

    order.paymentInfo.razorpayOrderId = razorpayOrderId;
    await order.save();

    return res.status(200).json({
      success: true,
      orderId: order._id,
      razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_5173PizzaDevKey",
      customer: {
        name: req.user.name,
        email: req.user.email,
        phone: order.deliveryAddress.phone,
      },
    });
  } catch (error) {
    console.error("Payment order generation failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to generate payment order",
      error: error.message,
    });
  }
};

// Verify payment signature strictly using HMAC SHA-256
export const verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!orderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "orderId, razorpayPaymentId, and razorpaySignature are strictly required for verification",
      });
    }

    const order = await Order.findById(orderId).populate("user", "name email phone");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 1. Strict HMAC-SHA256 Signature Verification
    const secret = process.env.RAZORPAY_KEY_SECRET || "dev_test_secret_998877";
    const expectedOrderId = razorpayOrderId || order.paymentInfo.razorpayOrderId;

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${expectedOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      console.warn(`[Security Alert] Payment signature mismatch for order ${orderId}! Rejecting order confirmation.`);
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed. Untrusted or forged transaction.",
      });
    }

    // 2. Perform Inventory Deduction with rollback and duplicate protection
    try {
      await deductOrderInventory(order);
    } catch (stockError) {
      console.error("[Inventory Deduction Failed]:", stockError.message);
      return res.status(409).json({
        success: false,
        message: `Payment received, but inventory reservation failed: ${stockError.message}`,
        error: stockError.message,
      });
    }

    // 3. Mark Order as Paid
    order.paymentInfo.status = "completed";
    order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
    order.paymentInfo.razorpayOrderId = expectedOrderId;
    order.paymentInfo.razorpaySignature = razorpaySignature;
    order.paymentInfo.paidAt = new Date();

    order.orderStatus = "Baking in Oven";
    order.statusHistory.push({
      status: "Baking in Oven",
      timestamp: new Date(),
      note: "Payment verified. Pizza is baking in the 450°C wood-fired oven!",
    });

    await order.save();

    // 4. Broadcast live Socket.IO events to User & Kitchen Admin
    emitOrderStatusUpdate(order._id, order);
    emitNewOrderToAdmin(order);

    return res.status(200).json({
      success: true,
      message: "Payment successfully verified! Your order is being prepared.",
      order,
    });
  } catch (error) {
    console.error("Payment verification failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Payment verification error",
      error: error.message,
    });
  }
};

// Handle payment failure from gateway
export const failPayment = async (req, res) => {
  try {
    const { orderId, errorDescription } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.paymentInfo.status = "failed";
    order.statusHistory.push({
      status: "Order Placed",
      timestamp: new Date(),
      note: `Payment attempt failed: ${errorDescription || "Gateway transaction rejected"}`,
    });
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order marked as payment failed. Inventory unaffected.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error recording failure" });
  }
};

// Handle payment cancelled by customer
export const cancelPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.statusHistory.push({
      status: "Order Placed",
      timestamp: new Date(),
      note: "Customer dismissed payment window.",
    });
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment cancellation logged. Order remains pending.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error logging cancellation" });
  }
};
