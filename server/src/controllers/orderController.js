import Order from "../models/Order.js";
import Ingredient from "../models/Ingredient.js";
import { emitOrderStatusUpdate, emitNewOrderToAdmin, emitLowStockAlert } from "../utils/socket.js";
import { checkAndNotifyLowStock } from "../utils/notificationService.js";

// Helper: Extract required ingredient quantities from order items
export const getIngredientRequirements = (items) => {
  const requirements = {}; // { ingredientId: { name, quantity } }

  for (const item of items) {
    const qty = item.quantity || 1;

    // Check custom components
    if (item.base && item.base.ingredientId) {
      const id = item.base.ingredientId.toString();
      requirements[id] = requirements[id] || { name: item.base.name, quantity: 0 };
      requirements[id].quantity += qty;
    }

    if (item.sauce && item.sauce.ingredientId) {
      const id = item.sauce.ingredientId.toString();
      requirements[id] = requirements[id] || { name: item.sauce.name, quantity: 0 };
      requirements[id].quantity += qty;
    }

    if (item.cheese && item.cheese.ingredientId) {
      const id = item.cheese.ingredientId.toString();
      requirements[id] = requirements[id] || { name: item.cheese.name, quantity: 0 };
      requirements[id].quantity += qty;
    }

    if (Array.isArray(item.veggies)) {
      for (const veg of item.veggies) {
        if (veg.ingredientId) {
          const id = veg.ingredientId.toString();
          requirements[id] = requirements[id] || { name: veg.name, quantity: 0 };
          requirements[id].quantity += qty;
        }
      }
    }
  }

  return requirements;
};

// Atomically deduct inventory with comprehensive rollback protection against race conditions
export const deductOrderInventory = async (order) => {
  if (order.inventoryDeducted) {
    console.log(`[Inventory] Order ${order._id} already had inventory deducted. Skipping.`);
    return { success: true, message: "Inventory already deducted" };
  }

  const requirements = getIngredientRequirements(order.items);
  const ingredientIds = Object.keys(requirements);

  if (ingredientIds.length === 0) {
    order.inventoryDeducted = true;
    await order.save();
    return { success: true };
  }

  // 1. Initial stock availability verification
  for (const ingId of ingredientIds) {
    const needed = requirements[ingId].quantity;
    const ingredient = await Ingredient.findById(ingId);

    if (!ingredient) {
      throw new Error(`Ingredient "${requirements[ingId].name}" not found in database.`);
    }

    if (ingredient.stock < needed) {
      throw new Error(
        `Insufficient inventory for "${ingredient.name}". Required: ${needed}, In Stock: ${ingredient.stock}`
      );
    }
  }

  // 2. Perform atomic deductions with rollback list
  const lowStockThreshold = parseInt(process.env.LOW_STOCK_THRESHOLD) || 20;
  const successfullyDeducted = []; // Track to rollback if later item fails

  try {
    for (const ingId of ingredientIds) {
      const needed = requirements[ingId].quantity;
      const updatedIngredient = await Ingredient.findOneAndUpdate(
        { _id: ingId, stock: { $gte: needed } },
        { $inc: { stock: -needed } },
        { returnDocument: "after" }
      );

      if (!updatedIngredient) {
        throw new Error(
          `Stock conflict: Insufficient inventory for "${requirements[ingId].name}". Failed to reserve stock.`
        );
      }

      successfullyDeducted.push({ ingId, needed });

      // Check for low stock condition and broadcast
      if (updatedIngredient.stock <= (updatedIngredient.threshold || lowStockThreshold)) {
        emitLowStockAlert(updatedIngredient);
      }
    }
  } catch (deductionErr) {
    // ROLLBACK: Revert all ingredients that were decremented before the failure
    console.warn(`[Inventory Rollback] Error during deduction: ${deductionErr.message}. Reverting partial changes...`);
    for (const item of successfullyDeducted) {
      await Ingredient.updateOne(
        { _id: item.ingId },
        { $inc: { stock: item.needed } }
      );
    }
    throw deductionErr;
  }

  order.inventoryDeducted = true;
  await order.save();

  // Trigger background threshold checks & alerts
  checkAndNotifyLowStock().catch((e) => console.error("Low stock notify error:", e));

  return { success: true };
};

// Create a new pending order
export const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Please add pizzas to your order.",
      });
    }

    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.street) {
      return res.status(400).json({
        success: false,
        message: "Full delivery address and contact phone are required.",
      });
    }

    // Pre-validate inventory before placing order
    const requirements = getIngredientRequirements(items);
    for (const ingId of Object.keys(requirements)) {
      const ing = await Ingredient.findById(ingId);
      if (!ing) continue;
      if (ing.stock < requirements[ingId].quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot place order: "${ing.name}" only has ${ing.stock} units remaining, but you requested ${requirements[ingId].quantity}.`,
        });
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.itemPrice * item.quantity), 0);
    const deliveryFee = subtotal > 500 ? 0 : 40; // Free delivery over ₹500
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const totalAmount = subtotal + deliveryFee + tax;

    const order = await Order.create({
      user: req.user._id,
      items,
      subtotal,
      deliveryFee,
      tax,
      totalAmount,
      deliveryAddress,
      paymentInfo: {
        method: paymentMethod || "razorpay",
        status: "pending",
      },
      orderStatus: "Order Placed",
      statusHistory: [
        {
          status: "Order Placed",
          timestamp: new Date(),
          note: "Order created successfully. Awaiting payment.",
        },
      ],
      inventoryDeducted: false,
    });

    return res.status(201).json({
      success: true,
      message: "Order initiated successfully",
      order,
    });
  } catch (error) {
    console.error("Create order failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to place order",
      error: error.message,
    });
  }
};

// Get current user's order history
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order history",
      error: error.message,
    });
  }
};

// Get single order details (Accessible by order owner or admin)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check authorization: must be the order owner or an admin
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not have permission to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};

// Admin: Get all orders with filtering and stats
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.orderStatus = status;
    }

    if (paymentStatus && paymentStatus !== "all") {
      filter["paymentInfo.status"] = paymentStatus;
    }

    const orders = await Order.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    const totalRevenue = orders
      .filter((o) => o.paymentInfo?.status === "completed")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingCount = orders.filter((o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length;

    return res.status(200).json({
      success: true,
      count: orders.length,
      totalRevenue,
      pendingCount,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders for admin",
      error: error.message,
    });
  }
};

// Admin: Update order status (triggers live Socket.IO update)
export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, note } = req.body;

    const validStatuses = [
      "Order Placed",
      "Baking in Oven",
      "In Kitchen",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Choose from: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;
    order.statusHistory.push({
      status: orderStatus,
      timestamp: new Date(),
      note: note || `Order updated to ${orderStatus} by Kitchen Team`,
    });

    await order.save();

    // Emit live update via Socket.IO
    emitOrderStatusUpdate(order._id, order);

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${orderStatus}"`,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};
