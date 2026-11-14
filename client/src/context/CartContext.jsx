import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("pizza_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("pizza_cart", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      // For pre-made pizzas of the exact same size without customizations, we increment quantity
      if (item.itemType === "preset" && !item.isCustomized) {
        const existingIndex = prev.findIndex(
          (i) => i.pizzaId === item.pizzaId && i.size === item.size
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex].quantity += item.quantity || 1;
          return updated;
        }
      }

      // For custom pizzas or distinct items, assign a unique cartId
      const newItem = {
        ...item,
        cartId: item.cartId || `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        quantity: item.quantity || 1,
      };
      return [...prev, newItem];
    });

    setIsDrawerOpen(true);
  };

  const removeFromCart = (cartId) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.itemPrice || item.price || 0) * (item.quantity || 1),
    0
  );

  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const totalAmount = subtotal + deliveryFee + tax;
  const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        deliveryFee,
        tax,
        totalAmount,
        itemCount,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
