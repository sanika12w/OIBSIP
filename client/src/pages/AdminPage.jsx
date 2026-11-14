import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  Plus,
  RefreshCw,
  ChefHat,
  Eye,
  Sliders,
  CheckCircle,
  X,
} from "lucide-react";
import { api } from "../api";
import { useSocket } from "../context/SocketContext";
import OrderStatusBadge from "../components/OrderStatusBadge";

const AdminPage = () => {
  const { socket, joinAdminRoom } = useSocket();
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'inventory' | 'menu'

  // Orders State
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [stats, setStats] = useState({ totalRevenue: 0, pendingCount: 0, totalOrders: 0 });

  // Inventory State
  const [ingredients, setIngredients] = useState([]);
  const [inventoryCategory, setInventoryCategory] = useState("all");
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  // Pizzas State
  const [pizzas, setPizzas] = useState([]);

  // Modals State
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    category: "vegetable",
    stock: 50,
    price: 25,
    threshold: 20,
  });

  const [showAddPizzaModal, setShowAddPizzaModal] = useState(false);
  const [newPizza, setNewPizza] = useState({
    name: "",
    description: "",
    price: 349,
    category: "veg",
    image: "",
    ingredientsList: "",
  });

  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    joinAdminRoom();
    loadDashboardData();

    if (socket) {
      socket.on("new_order_received", (newOrder) => {
        console.log("[Socket.IO Admin] New order received:", newOrder);
        setOrders((prev) => [newOrder, ...prev]);
        setStats((prev) => ({
          ...prev,
          totalOrders: prev.totalOrders + 1,
          pendingCount: prev.pendingCount + 1,
          totalRevenue: prev.totalRevenue + (newOrder.totalAmount || 0),
        }));
        showToast(`🔔 New Order received: #${newOrder._id.slice(-6).toUpperCase()}`);
      });

      socket.on("low_stock_alert", (alertItem) => {
        console.log("[Socket.IO Admin] Low stock alert:", alertItem);
        showToast(`⚠️ Low Stock Alert: "${alertItem.name}" has only ${alertItem.stock} left!`);
        loadIngredients();
      });
    }

    return () => {
      if (socket) {
        socket.off("new_order_received");
        socket.off("low_stock_alert");
      }
    };
  }, [socket]);

  const showToast = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 4500);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadOrders(), loadIngredients(), loadPizzas()]);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await api.orders.getAllAdmin();
      setOrders(data.orders || []);
      setStats({
        totalRevenue: data.totalRevenue || 0,
        pendingCount: data.pendingCount || 0,
        totalOrders: data.count || 0,
      });
    } catch (e) {
      console.error("Failed to load admin orders:", e);
    }
  };

  const loadIngredients = async () => {
    try {
      const data = await api.ingredients.getAllAdmin();
      setIngredients(data.ingredients || []);
      const lowOnes = (data.ingredients || []).filter((i) => i.isLowStock || i.stock <= i.threshold);
      setLowStockAlerts(lowOnes);
    } catch (e) {
      console.error("Failed to load admin ingredients:", e);
    }
  };

  const loadPizzas = async () => {
    try {
      const data = await api.pizzas.getAllAdmin();
      setPizzas(data.pizzas || []);
    } catch (e) {
      console.error("Failed to load admin pizzas:", e);
    }
  };

  // 1-Click Order Status Changer
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.orders.updateStatusAdmin(orderId, { orderStatus: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      showToast(`Order status updated to "${newStatus}"`);
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  // Quick Restock (+10 or +50)
  const handleRestock = async (ingId, delta) => {
    try {
      const res = await api.ingredients.updateStock(ingId, { delta });
      setIngredients((prev) =>
        prev.map((item) => (item._id === ingId ? res.ingredient : item))
      );
      showToast(`Restocked ${res.ingredient.name} by +${delta}`);
      loadIngredients();
    } catch (err) {
      alert(`Restock failed: ${err.message}`);
    }
  };

  // Set Exact Stock
  const handleSetExactStock = async (ingId, stock) => {
    try {
      const res = await api.ingredients.updateStock(ingId, { stock: Math.max(0, stock) });
      setIngredients((prev) =>
        prev.map((item) => (item._id === ingId ? res.ingredient : item))
      );
      showToast(`Set ${res.ingredient.name} stock to ${res.ingredient.stock} units`);
      loadIngredients();
    } catch (err) {
      alert(`Stock update failed: ${err.message}`);
    }
  };

  // Toggle Ingredient Availability
  const handleToggleIngredientAvailability = async (ing) => {
    try {
      const updated = await api.ingredients.update(ing._id, {
        isAvailable: !ing.isAvailable,
      });
      setIngredients((prev) =>
        prev.map((item) => (item._id === ing._id ? updated.ingredient : item))
      );
      showToast(`Updated availability for ${ing.name}`);
    } catch (err) {
      alert(`Toggle failed: ${err.message}`);
    }
  };

  // Add New Ingredient
  const handleAddIngredient = async (e) => {
    e.preventDefault();
    try {
      await api.ingredients.create(newIngredient);
      setShowAddIngredientModal(false);
      setNewIngredient({ name: "", category: "vegetable", stock: 50, price: 25, threshold: 20 });
      showToast("New ingredient added to pantry!");
      loadIngredients();
    } catch (err) {
      alert(`Failed to add ingredient: ${err.message}`);
    }
  };

  // Add New Pizza Preset
  const handleAddPizza = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newPizza,
        ingredientsList: newPizza.ingredientsList
          ? newPizza.ingredientsList.split(",").map((s) => s.trim())
          : [],
      };
      await api.pizzas.create(payload);
      setShowAddPizzaModal(false);
      setNewPizza({ name: "", description: "", price: 349, category: "veg", image: "", ingredientsList: "" });
      showToast("New pizza added to signature menu!");
      loadPizzas();
    } catch (err) {
      alert(`Failed to create pizza: ${err.message}`);
    }
  };

  // Filtered orders list
  const filteredOrders =
    orderStatusFilter === "all"
      ? orders
      : orders.filter((o) => {
          if (orderStatusFilter === "Baking in Oven") {
            return o.orderStatus === "Baking in Oven" || o.orderStatus === "In Kitchen";
          }
          return o.orderStatus === orderStatusFilter;
        });

  // Filtered ingredients list
  const filteredIngredients =
    inventoryCategory === "all"
      ? ingredients
      : ingredients.filter((i) => i.category === inventoryCategory);

  return (
    <div style={{ padding: "2.5rem 0 6rem 0" }}>
      <div className="container">
        
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ShieldCheck size={24} color="var(--gold-primary)" />
              <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#FFF" }}>
                Kitchen & Inventory Command
              </h1>
            </div>
            <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
              Live dispatcher, real-time stock thresholds, and pizza recipe management.
            </p>
          </div>

          <button
            onClick={loadDashboardData}
            className="btn-outline btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
        </div>

        {/* Action / Notification Toast */}
        {actionMessage && (
          <div
            style={{
              padding: "0.85rem 1.25rem",
              borderRadius: "10px",
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              color: "var(--gold-primary)",
              fontWeight: 700,
              fontSize: "0.92rem",
              marginBottom: "1.8rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>{actionMessage}</div>
            <X size={16} style={{ cursor: "pointer" }} onClick={() => setActionMessage("")} />
          </div>
        )}

        {/* High-Level Metric Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
            marginBottom: "2.5rem",
          }}
        >
          <div className="glass-panel" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)", fontSize: "0.82rem", textTransform: "uppercase" }}>
              <span>Total Revenue</span>
              <TrendingUp size={18} color="var(--herb-green)" />
            </div>
            <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--gold-primary)", marginTop: "6px" }}>
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--herb-green)", marginTop: "4px" }}>
              Verified Razorpay Transactions
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)", fontSize: "0.82rem", textTransform: "uppercase" }}>
              <span>Active Orders</span>
              <Clock size={18} color="var(--flame-primary)" />
            </div>
            <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#FFF", marginTop: "6px" }}>
              {stats.pendingCount}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--flame-primary)", marginTop: "4px" }}>
              Needs baking & dispatching
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)", fontSize: "0.82rem", textTransform: "uppercase" }}>
              <span>Total Orders Placed</span>
              <Package size={18} color="var(--blue-info)" />
            </div>
            <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#FFF", marginTop: "6px" }}>
              {stats.totalOrders}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "4px" }}>
              Lifetime platform orders
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)", fontSize: "0.82rem", textTransform: "uppercase" }}>
              <span>Low-Stock Warnings</span>
              <AlertTriangle size={18} color={lowStockAlerts.length > 0 ? "var(--crimson-red)" : "var(--herb-green)"} />
            </div>
            <div style={{ fontSize: "1.9rem", fontWeight: 800, color: lowStockAlerts.length > 0 ? "var(--crimson-red)" : "var(--herb-green)", marginTop: "6px" }}>
              {lowStockAlerts.length}
            </div>
            <div style={{ fontSize: "0.75rem", color: lowStockAlerts.length > 0 ? "var(--crimson-red)" : "var(--herb-green)", marginTop: "4px" }}>
              {lowStockAlerts.length > 0 ? "Urgent restocking required" : "Pantry fully stocked"}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "0.75rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "1rem", marginBottom: "2rem" }}>
          <button
            onClick={() => setActiveTab("orders")}
            style={{
              padding: "0.6rem 1.4rem",
              borderRadius: "var(--radius-sm)",
              background: activeTab === "orders" ? "var(--flame-gradient)" : "rgba(255,255,255,0.05)",
              color: activeTab === "orders" ? "#FFF" : "var(--text-secondary)",
              fontWeight: 700,
              fontSize: "0.92rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Clock size={16} /> Live Kitchen Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            style={{
              padding: "0.6rem 1.4rem",
              borderRadius: "var(--radius-sm)",
              background: activeTab === "inventory" ? "var(--flame-gradient)" : "rgba(255,255,255,0.05)",
              color: activeTab === "inventory" ? "#FFF" : "var(--text-secondary)",
              fontWeight: 700,
              fontSize: "0.92rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Package size={16} /> Inventory & Stock Monitor ({ingredients.length})
            {lowStockAlerts.length > 0 && (
              <span style={{ background: "var(--crimson-red)", color: "#FFF", borderRadius: "50%", padding: "2px 6px", fontSize: "0.72rem" }}>
                {lowStockAlerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("menu")}
            style={{
              padding: "0.6rem 1.4rem",
              borderRadius: "var(--radius-sm)",
              background: activeTab === "menu" ? "var(--flame-gradient)" : "rgba(255,255,255,0.05)",
              color: activeTab === "menu" ? "#FFF" : "var(--text-secondary)",
              fontWeight: 700,
              fontSize: "0.92rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <ChefHat size={16} /> Signature Menu ({pizzas.length})
          </button>
        </div>

        {/* TAB 1: LIVE KITCHEN ORDERS */}
        {activeTab === "orders" && (
          <div>
            {/* Filter pills */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              {["all", "Order Placed", "Baking in Oven", "Out for Delivery", "Delivered", "Cancelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  style={{
                    padding: "0.4rem 0.9rem",
                    borderRadius: "20px",
                    background: orderStatusFilter === st ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.03)",
                    color: orderStatusFilter === st ? "#FFF" : "var(--text-muted)",
                    border: "1px solid var(--border-glass)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {st === "all" ? "All Statuses" : st}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                No orders match this status filter.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {filteredOrders.map((order) => (
                  <div
                    key={order._id}
                    className="glass-panel"
                    style={{
                      padding: "1.5rem",
                      borderRadius: "14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.8rem" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#FFF" }}>
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            • Customer: <strong>{order.deliveryAddress?.fullName}</strong> ({order.deliveryAddress?.phone})
                          </span>
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: "2px" }}>
                          {new Date(order.createdAt).toLocaleString()} • {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                        </div>
                      </div>

                      {/* Status Dropdown Controller (Triggers Live Socket Event) */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Change Status:</span>
                        <select
                          value={order.orderStatus === "In Kitchen" ? "Baking in Oven" : order.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          style={{
                            background: "var(--bg-surface)",
                            color: "var(--gold-primary)",
                            border: "1px solid var(--border-glass-bright)",
                            borderRadius: "6px",
                            padding: "0.45rem 0.8rem",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            cursor: "pointer",
                          }}
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Baking in Oven">Baking in Oven</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Items breakdown */}
                    <div
                      style={{
                        padding: "0.85rem",
                        borderRadius: "8px",
                        background: "rgba(0, 0, 0, 0.3)",
                        border: "1px solid var(--border-glass)",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                            <div>
                              <strong style={{ color: "#FFF" }}>{item.quantity}x {item.name}</strong> ({item.size})
                              {item.itemType === "custom" && (
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                                  Base: {item.base?.name} | Sauce: {item.sauce?.name} | Cheese: {item.cheese?.name} | Toppings: {item.veggies?.map((v) => v.name).join(", ")}
                                </div>
                              )}
                            </div>
                            <span style={{ color: "var(--gold-primary)", fontWeight: 700 }}>
                              ₹{item.itemPrice * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                      <div style={{ color: "var(--text-muted)" }}>
                        Payment: <strong style={{ color: "#FFF" }}>{order.paymentInfo?.status?.toUpperCase()}</strong> ({order.paymentInfo?.method})
                        {order.inventoryDeducted && (
                          <span style={{ color: "var(--herb-green)", marginLeft: "0.8rem" }}>
                            ✓ Stock Deducted
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--gold-primary)" }}>
                        Total: ₹{order.totalAmount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INVENTORY & STOCK MONITOR */}
        {activeTab === "inventory" && (
          <div>
            {/* Low stock alert banner */}
            {lowStockAlerts.length > 0 && (
              <div
                style={{
                  padding: "1rem 1.5rem",
                  borderRadius: "12px",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  marginBottom: "1.8rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                }}
              >
                <AlertTriangle size={24} color="var(--crimson-red)" />
                <div>
                  <div style={{ fontWeight: 800, color: "#F87171" }}>
                    Critical Stock Threshold Warnings ({lowStockAlerts.length} items)
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#FCA5A5" }}>
                    The following ingredients have fallen below restocking safety levels:{" "}
                    <strong>{lowStockAlerts.map((i) => `${i.name} (${i.stock})`).join(", ")}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Controls Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              {/* Category selector */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {["all", "base", "sauce", "cheese", "vegetable"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setInventoryCategory(cat)}
                    style={{
                      padding: "0.4rem 0.9rem",
                      borderRadius: "20px",
                      background: inventoryCategory === cat ? "var(--flame-gradient)" : "rgba(255,255,255,0.05)",
                      color: inventoryCategory === cat ? "#FFF" : "var(--text-muted)",
                      border: "1px solid var(--border-glass)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {cat === "all" ? "All Ingredients" : cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAddIngredientModal(true)}
                className="btn-flame btn-sm"
                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <Plus size={15} /> Add New Ingredient
              </button>
            </div>

            {/* Ingredients Table */}
            <div className="glass-panel" style={{ overflowX: "auto", borderRadius: "14px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-glass)", background: "rgba(0, 0, 0, 0.3)" }}>
                    <th style={{ padding: "0.85rem 1.25rem", color: "var(--text-muted)", fontWeight: 700 }}>Ingredient</th>
                    <th style={{ padding: "0.85rem 1rem", color: "var(--text-muted)", fontWeight: 700 }}>Category</th>
                    <th style={{ padding: "0.85rem 1rem", color: "var(--text-muted)", fontWeight: 700 }}>Unit Price</th>
                    <th style={{ padding: "0.85rem 1rem", color: "var(--text-muted)", fontWeight: 700 }}>Current Stock</th>
                    <th style={{ padding: "0.85rem 1rem", color: "var(--text-muted)", fontWeight: 700 }}>Status</th>
                    <th style={{ padding: "0.85rem 1.25rem", color: "var(--text-muted)", fontWeight: 700, textAlign: "right" }}>Quick Restock Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIngredients.map((ing) => {
                    const isLow = ing.stock <= ing.threshold;
                    const isOut = ing.stock === 0;

                    return (
                      <tr key={ing._id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                        <td style={{ padding: "0.85rem 1.25rem", fontWeight: 700, color: "#FFF" }}>
                          {ing.name}
                        </td>
                        <td style={{ padding: "0.85rem 1rem", color: "var(--text-secondary)", textTransform: "capitalize" }}>
                          {ing.category}
                        </td>
                        <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "var(--gold-primary)" }}>
                          ₹{ing.price}
                        </td>
                        <td style={{ padding: "0.85rem 1rem", fontWeight: 800 }}>
                          <span style={{ color: isOut ? "var(--crimson-red)" : isLow ? "var(--gold-primary)" : "var(--herb-green)" }}>
                            {ing.stock} units
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          {isOut ? (
                            <span className="badge badge-lowstock">Out of Stock</span>
                          ) : isLow ? (
                            <span className="badge badge-lowstock">Low Stock (≤{ing.threshold})</span>
                          ) : (
                            <span className="badge badge-veg">Healthy Stock</span>
                          )}
                        </td>
                        <td style={{ padding: "0.85rem 1.25rem", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                            <button
                              onClick={() => handleRestock(ing._id, 10)}
                              className="btn-outline btn-sm"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.78rem" }}
                              title="Add 10 units"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => handleRestock(ing._id, 50)}
                              className="btn-outline btn-sm"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.78rem" }}
                              title="Add 50 units"
                            >
                              +50
                            </button>
                            <button
                              onClick={() => {
                                const val = prompt(`Enter new exact stock count for "${ing.name}":`, ing.stock);
                                if (val !== null && val.trim() !== "" && !isNaN(Number(val))) {
                                  handleSetExactStock(ing._id, Number(val));
                                }
                              }}
                              className="btn-outline btn-sm"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.78rem", color: "var(--gold-primary)" }}
                              title="Set exact stock level"
                            >
                              Set...
                            </button>
                            <button
                              onClick={() => handleToggleIngredientAvailability(ing)}
                              style={{
                                background: ing.isAvailable ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                color: ing.isAvailable ? "var(--herb-green)" : "var(--crimson-red)",
                                border: "1px solid var(--border-glass)",
                                borderRadius: "6px",
                                padding: "0.3rem 0.6rem",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              {ing.isAvailable ? "Enabled" : "Disabled"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SIGNATURE MENU MANAGER */}
        {activeTab === "menu" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Add, adjust pricing, or change active status of signature menu pizzas.
              </div>
              <button
                onClick={() => setShowAddPizzaModal(true)}
                className="btn-flame btn-sm"
                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <Plus size={15} /> Add Signature Pizza
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {pizzas.map((p) => (
                <div key={p._id} className="glass-panel" style={{ padding: "1.25rem", borderRadius: "14px" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <img
                      src={p.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400"}
                      alt={p.name}
                      style={{ width: "70px", height: "70px", borderRadius: "10px", objectFit: "cover" }}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 700, color: "#FFF", fontSize: "1rem" }}>{p.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--gold-primary)", fontWeight: 700 }}>
                        ₹{p.price} • {p.category}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "2px" }}>
                        {p.isAvailable ? "Available to Customers" : "Hidden from Menu"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: ADD INGREDIENT */}
        {showAddIngredientModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 3000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.75)",
              padding: "1rem",
            }}
          >
            <div className="glass-panel" style={{ width: "100%", maxWidth: "460px", padding: "1.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFF" }}>
                  Add Pantry Ingredient
                </h3>
                <X size={18} style={{ cursor: "pointer" }} onClick={() => setShowAddIngredientModal(false)} />
              </div>

              <form onSubmit={handleAddIngredient} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Ingredient Name</label>
                  <input
                    type="text"
                    required
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Gorgonzola Cheese"
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Category</label>
                  <select
                    value={newIngredient.category}
                    onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="base">Base Crust</option>
                    <option value="sauce">Sauce</option>
                    <option value="cheese">Cheese</option>
                    <option value="vegetable">Vegetable</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Initial Stock</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newIngredient.stock}
                      onChange={(e) => setNewIngredient({ ...newIngredient, stock: parseInt(e.target.value) || 0 })}
                      className="input-field"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Price (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newIngredient.price}
                      onChange={(e) => setNewIngredient({ ...newIngredient, price: parseFloat(e.target.value) || 0 })}
                      className="input-field"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-flame" style={{ marginTop: "0.5rem" }}>
                  Save to Inventory
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD PIZZA PRESET */}
        {showAddPizzaModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 3000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.75)",
              padding: "1rem",
            }}
          >
            <div className="glass-panel" style={{ width: "100%", maxWidth: "500px", padding: "1.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFF" }}>
                  Add Signature Pizza Recipe
                </h3>
                <X size={18} style={{ cursor: "pointer" }} onClick={() => setShowAddPizzaModal(false)} />
              </div>

              <form onSubmit={handleAddPizza} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Pizza Name</label>
                  <input
                    type="text"
                    required
                    value={newPizza.name}
                    onChange={(e) => setNewPizza({ ...newPizza, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Truffle Ricotta Bianco"
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Description</label>
                  <textarea
                    required
                    rows={2}
                    value={newPizza.description}
                    onChange={(e) => setNewPizza({ ...newPizza, description: e.target.value })}
                    className="input-field"
                    placeholder="Artisan description of flavors & crust"
                  />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Price (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newPizza.price}
                      onChange={(e) => setNewPizza({ ...newPizza, price: parseFloat(e.target.value) || 0 })}
                      className="input-field"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Category</label>
                    <select
                      value={newPizza.category}
                      onChange={(e) => setNewPizza({ ...newPizza, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="veg">Vegetarian</option>
                      <option value="specialty">Chef's Specialty</option>
                      <option value="artisan">Artisan Gourmet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Image URL</label>
                  <input
                    type="url"
                    value={newPizza.image}
                    onChange={(e) => setNewPizza({ ...newPizza, image: e.target.value })}
                    className="input-field"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <button type="submit" className="btn-flame" style={{ marginTop: "0.5rem" }}>
                  Publish Pizza to Menu
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPage;
