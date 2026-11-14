import express from "express";
import cors from "cors";

import ingredientRoutes from "./routes/ingredientRoutes.js";
import pizzaRoutes from "./routes/pizzaRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/pizzas", pizzaRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Pizza Delivery API is running!",
    timestamp: new Date().toISOString(),
  });
});

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route '${req.originalUrl}' not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

export default app;
