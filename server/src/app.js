
import express from "express";
import cors from "cors";

const app = express();

import ingredientRoutes from "./routes/ingredientRoutes.js";
import pizzaRoutes from "./routes/pizzaRoutes.js";

// Middleware
app.use(cors(
    {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }
));
app.use(express.json());

app.use("/api/ingredients", ingredientRoutes);
app.use("/api/pizzas", pizzaRoutes);

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Pizza Delivery API is running!",
  });
});

export default app;
