import express from "express";
import {
  getPaymentConfig,
  createPaymentOrder,
  verifyPayment,
  failPayment,
  cancelPayment,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/config", protect, getPaymentConfig);
router.post("/create-order", protect, createPaymentOrder);
router.post("/verify", protect, verifyPayment);
router.post("/fail", protect, failPayment);
router.post("/cancel", protect, cancelPayment);

export default router;
