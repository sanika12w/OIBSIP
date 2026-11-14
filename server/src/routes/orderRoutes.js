import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/admin/all", protect, adminOnly, getAllOrdersAdmin);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, adminOnly, updateOrderStatusAdmin);

export default router;
