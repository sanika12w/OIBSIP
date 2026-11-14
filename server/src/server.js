import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cron from "node-cron";
import app from "./app.js";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Order from "./models/Order.js";
import { setIO } from "./utils/socket.js";
import { checkAndNotifyLowStock } from "./utils/notificationService.js";

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Create HTTP server wrapping Express app
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

setIO(io);

// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "sanika12wljhlwjdafv");
      const user = await User.findById(decoded.userId).select("-password");
      if (user) {
        socket.user = user;
      }
    }
    next();
  } catch (err) {
    // Continue connection for public pages, but user will be unauthenticated
    next();
  }
});

// Socket.IO event handlers with strict authorization checks
io.on("connection", (socket) => {
  // User joins their specific order tracking room
  socket.on("join_order_room", async (data) => {
    const orderId = typeof data === "object" && data !== null ? data.orderId : data;
    const clientToken = typeof data === "object" && data !== null ? data.token : null;

    if (!orderId) return;

    try {
      // Lazy authentication: verify token passed with room join if not set on handshake
      if (!socket.user && clientToken) {
        try {
          const decoded = jwt.verify(clientToken, process.env.JWT_SECRET || "sanika12wljhlwjdafv");
          const user = await User.findById(decoded.userId).select("-password");
          if (user) socket.user = user;
        } catch {}
      }

      // Security check: Must be authenticated and either the order owner or an admin
      if (!socket.user) {
        return socket.emit("auth_error", {
          message: "Authentication required to join order tracking room",
        });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return socket.emit("error", { message: "Order not found" });
      }

      const isOwner = order.user.toString() === socket.user._id.toString();
      const isAdmin = socket.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return socket.emit("auth_error", {
          message: "Forbidden: You cannot access updates for another customer's order",
        });
      }

      socket.join(`order_${orderId}`);
      socket.emit("room_joined", { orderId });
      console.log(`[Socket.IO] Authenticated user ${socket.user.email} joined order_${orderId}`);
    } catch (e) {
      console.error("[Socket.IO] Join order room error:", e.message);
    }
  });

  // Admin joins the admin dashboard room for live incoming orders & stock alerts
  socket.on("join_admin_room", async (data) => {
    const clientToken = typeof data === "object" && data !== null ? data.token : null;

    if (!socket.user && clientToken) {
      try {
        const decoded = jwt.verify(clientToken, process.env.JWT_SECRET || "sanika12wljhlwjdafv");
        const user = await User.findById(decoded.userId).select("-password");
        if (user) socket.user = user;
      } catch {}
    }

    if (!socket.user || socket.user.role !== "admin") {
      return socket.emit("auth_error", {
        message: "Forbidden: Admin privileges required to join admin room",
      });
    }

    socket.join("admin_room");
    socket.emit("admin_room_joined");
    console.log(`[Socket.IO] Admin ${socket.user.email} joined admin_room`);
  });

  socket.on("disconnect", () => {
    // Socket disconnected
  });
});

// Seed default Admin account if not present
const ensureAdminAccount = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@pizzadelivery.com").toLowerCase().trim();
    const defaultPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);

      await User.create({
        name: "Head Chef Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isEmailVerified: true,
      });

      console.log(`[System] Default admin created: ${adminEmail}`);
    } else {
      let updated = false;
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        updated = true;
      }
      if (!existingAdmin.isEmailVerified) {
        existingAdmin.isEmailVerified = true;
        updated = true;
      }
      const match = await bcrypt.compare(defaultPassword, existingAdmin.password);
      if (!match) {
        existingAdmin.password = await bcrypt.hash(defaultPassword, 12);
        updated = true;
      }
      if (updated) {
        await existingAdmin.save();
        console.log(`[System] Admin account synced with .env credentials: ${adminEmail}`);
      }
    }
  } catch (error) {
    console.error("[System] Admin account initialization check failed:", error.message);
  }
};

// Start Server
connectDB()
  .then(async () => {
    // Ensure default admin exists
    await ensureAdminAccount();

    // Check inventory stock on startup
    checkAndNotifyLowStock().catch((e) => console.error("Initial stock check error:", e));

    // Scheduled cron job using node-cron: Runs every 15 minutes
    cron.schedule("*/15 * * * *", () => {
      console.log("[node-cron] Running scheduled low-stock inventory check...");
      checkAndNotifyLowStock().catch((e) => console.error("Scheduled cron stock check error:", e));
    });
    console.log("⏰ node-cron job registered: low-stock monitoring scheduled every 15 minutes");

    server.listen(PORT, () => {
      console.log(`🚀 Pizza Delivery Server running on http://localhost:${PORT}`);
      console.log(`⚡ Socket.IO initialized with secure room isolation`);
    });
  })
  .catch((err) => {
    console.error("Server startup aborted due to DB connection error:", err.message);
    process.exit(1);
  });
