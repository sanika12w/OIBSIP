import express from "express";
import {
  getIngredients,
  getAllIngredientsAdmin,
  updateIngredientStock,
  addIngredient,
  updateIngredient,
  deleteIngredient,
  getLowStockIngredients,
} from "../controllers/ingredientController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route
router.get("/", getIngredients);

// Admin routes
router.get("/admin/all", protect, adminOnly, getAllIngredientsAdmin);
router.get("/admin/low-stock", protect, adminOnly, getLowStockIngredients);
router.post("/", protect, adminOnly, addIngredient);
router.put("/:id/stock", protect, adminOnly, updateIngredientStock);
router.put("/:id", protect, adminOnly, updateIngredient);
router.delete("/:id", protect, adminOnly, deleteIngredient);

export default router;
