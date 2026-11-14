import React from "react";
import { Clock, ChefHat, Bike, CheckCircle2, XCircle } from "lucide-react";

const OrderStatusBadge = ({ status }) => {
  switch (status) {
    case "Order Placed":
      return (
        <span className="badge badge-status-placed">
          <Clock size={12} /> Placed
        </span>
      );
    case "Baking in Oven":
    case "In Kitchen":
      return (
        <span className="badge badge-status-kitchen">
          <ChefHat size={12} /> Baking in Oven
        </span>
      );
    case "Out for Delivery":
      return (
        <span className="badge badge-status-out">
          <Bike size={12} /> Out for Delivery
        </span>
      );
    case "Delivered":
      return (
        <span className="badge badge-status-delivered">
          <CheckCircle2 size={12} /> Delivered
        </span>
      );
    case "Cancelled":
      return (
        <span className="badge badge-lowstock">
          <XCircle size={12} /> Cancelled
        </span>
      );
    default:
      return (
        <span className="badge">
          {status}
        </span>
      );
  }
};

export default OrderStatusBadge;
