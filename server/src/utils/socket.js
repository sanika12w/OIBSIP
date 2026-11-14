let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => {
  return ioInstance;
};

export const emitOrderStatusUpdate = (orderId, order) => {
  if (ioInstance) {
    ioInstance.to(`order_${orderId}`).emit("order_status_updated", {
      orderId,
      orderStatus: order.orderStatus,
      statusHistory: order.statusHistory,
      updatedAt: new Date(),
    });

    // Also notify admin
    ioInstance.to("admin_room").emit("admin_order_updated", order);
  }
};

export const emitNewOrderToAdmin = (order) => {
  if (ioInstance) {
    ioInstance.to("admin_room").emit("new_order_received", order);
  }
};

export const emitLowStockAlert = (ingredient) => {
  if (ioInstance) {
    ioInstance.to("admin_room").emit("low_stock_alert", {
      ingredientId: ingredient._id,
      name: ingredient.name,
      category: ingredient.category,
      stock: ingredient.stock,
      threshold: ingredient.threshold,
      timestamp: new Date(),
    });
  }
};
