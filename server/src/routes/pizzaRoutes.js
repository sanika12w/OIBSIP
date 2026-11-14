import express from "express";
import {
  getPizzas,
  getPizzaById,
  getAllPizzasAdmin,
  createPizza,
  updatePizza,
  deletePizza,
} from "../controllers/pizzaController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getPizzas);
router.get("/:id", getPizzaById);

// Admin routes
router.get("/admin/all", protect, adminOnly, getAllPizzasAdmin);
router.post("/", protect, adminOnly, createPizza);
router.put("/:id", protect, adminOnly, updatePizza);
router.delete("/:id", protect, adminOnly, deletePizza);

export default router;
