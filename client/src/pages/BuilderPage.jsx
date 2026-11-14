import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Sparkles, Check, AlertCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { api } from "../api";
import { useCart } from "../context/CartContext";
import CustomPizzaVisualizer from "../components/CustomPizzaVisualizer";

const BuilderPage = () => {
  const [searchParams] = useSearchParams();
  const presetId = searchParams.get("preset");
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [ingredients, setIngredients] = useState({
    base: [],
    sauce: [],
    cheese: [],
    vegetable: [],
  });

  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedSauce, setSelectedSauce] = useState(null);
  const [selectedCheese, setSelectedCheese] = useState(null);
  const [selectedVeggies, setSelectedVeggies] = useState([]);
  const [selectedSize, setSelectedSize] = useState("Medium");
  const [customName, setCustomName] = useState("Artisan Custom Pizza");
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(true);

  // Size multipliers
  const sizeMultipliers = {
    Regular: 1.0,
    Medium: 1.25,
    Large: 1.55,
  };

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        setLoading(true);
        const data = await api.ingredients.getAvailable();
        if (data.categorized) {
          setIngredients(data.categorized);

          // Default selections if available
          if (data.categorized.base?.length > 0) setSelectedBase(data.categorized.base[0]);
          if (data.categorized.sauce?.length > 0) setSelectedSauce(data.categorized.sauce[0]);
          if (data.categorized.cheese?.length > 0) setSelectedCheese(data.categorized.cheese[0]);
        }

        // Check if customizing from a preset pizza
        if (presetId) {
          try {
            const pizzaRes = await api.pizzas.getById(presetId);
            if (pizzaRes.pizza) {
              setCustomName(`Customized ${pizzaRes.pizza.name}`);
            }
          } catch (e) {
            console.warn("Preset pizza lookup failed:", e);
          }
        }
      } catch (err) {
        console.error("Failed to load ingredients for builder:", err);
      } finally {
        setLoading(false);
      }
    };

    loadIngredients();
  }, [presetId]);

  // Toggle vegetable selection
  const handleToggleVeggie = (veg) => {
    setSelectedVeggies((prev) => {
      const exists = prev.some((v) => v._id === veg._id);
      if (exists) {
        return prev.filter((v) => v._id !== veg._id);
      } else {
        return [...prev, veg];
      }
    });
  };

  // Calculate dynamic price
  const basePrice = selectedBase?.price || 0;
  const saucePrice = selectedSauce?.price || 0;
  const cheesePrice = selectedCheese?.price || 0;
  const veggiesPrice = selectedVeggies.reduce((sum, v) => sum + (v.price || 0), 0);
  const rawTotal = basePrice + saucePrice + cheesePrice + veggiesPrice;
  const multiplier = sizeMultipliers[selectedSize] || 1.0;
  const calculatedPrice = Math.round(rawTotal * multiplier);

  const handleAddToCart = () => {
    if (!selectedBase || !selectedSauce || !selectedCheese) {
      alert("Please select a base crust, sauce, and cheese to complete your pizza.");
      return;
    }

    addToCart({
      itemType: "custom",
      name: customName || "Artisan Custom Pizza",
      size: selectedSize,
      itemPrice: calculatedPrice,
      price: calculatedPrice,
      quantity: 1,
      base: {
        name: selectedBase.name,
        ingredientId: selectedBase._id,
        price: selectedBase.price,
      },
      sauce: {
        name: selectedSauce.name,
        ingredientId: selectedSauce._id,
        price: selectedSauce.price,
      },
      cheese: {
        name: selectedCheese.name,
        ingredientId: selectedCheese._id,
        price: selectedCheese.price,
      },
      veggies: selectedVeggies.map((v) => ({
        name: v.name,
        ingredientId: v._id,
        price: v.price,
      })),
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 0", color: "var(--text-muted)" }}>
        <div style={{ fontSize: "2.5rem" }} className="spin-slow">🍕</div>
        <p style={{ marginTop: "1rem" }}>Preheating oven & stocking kitchen ingredients...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2.5rem 0 6rem 0" }}>
      <div className="container">
        
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--gold-primary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "0.4rem" }}>
            Interactive Custom Pizza Kitchen
          </div>
          <h1 style={{ fontSize: "2.6rem", fontWeight: 800, color: "#FFF", marginBottom: "0.5rem" }}>
            Design Your Masterpiece
          </h1>
          <p style={{ color: "var(--text-secondary)", maxWidth: "580px", margin: "0 auto" }}>
            Select every fresh ingredient from our live pantry. Watch your creation assemble in real-time.
          </p>
        </div>

        {/* Builder Layout: Split View (Canvas & Customizer) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "2.5rem",
            alignItems: "start",
          }}
        >
          {/* Left Column: Live Visualizer & Price Card */}
          <div style={{ position: "sticky", top: "90px" }}>
            <div
              className="glass-panel"
              style={{
                padding: "2rem",
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <CustomPizzaVisualizer
                base={selectedBase}
                sauce={selectedSauce}
                cheese={selectedCheese}
                veggies={selectedVeggies}
                size={selectedSize}
              />

              {/* Pizza Custom Name Input */}
              <div style={{ width: "100%", marginTop: "1rem" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                  Name Your Pizza
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="input-field"
                  style={{ textAlign: "center", fontWeight: 700, fontSize: "1.05rem" }}
                />
              </div>

              {/* Size Selector Pills */}
              <div style={{ width: "100%", marginTop: "1.2rem" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "6px" }}>
                  Select Size
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                  {["Regular", "Medium", "Large"].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: "0.5rem",
                        background: selectedSize === size ? "var(--flame-gradient)" : "rgba(255,255,255,0.05)",
                        color: selectedSize === size ? "#FFF" : "var(--text-secondary)",
                        border: selectedSize === size ? "none" : "1px solid var(--border-glass)",
                        borderRadius: "8px",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Dynamic Price Breakdown */}
              <div
                style={{
                  width: "100%",
                  marginTop: "1.5rem",
                  padding: "1rem",
                  borderRadius: "12px",
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid var(--border-glass)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  <span>Base ({selectedBase?.name || "None"})</span>
                  <span>₹{basePrice}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  <span>Sauce ({selectedSauce?.name || "None"})</span>
                  <span>₹{saucePrice}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  <span>Cheese ({selectedCheese?.name || "None"})</span>
                  <span>₹{cheesePrice}</span>
                </div>
                {selectedVeggies.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                    <span>Toppings ({selectedVeggies.length})</span>
                    <span>₹{veggiesPrice}</span>
                  </div>
                )}
                {multiplier !== 1.0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--gold-primary)", marginBottom: "4px" }}>
                    <span>{selectedSize} Size Multiplier</span>
                    <span>{multiplier}x</span>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--border-glass)",
                    paddingTop: "0.6rem",
                    marginTop: "0.6rem",
                  }}
                >
                  <span style={{ fontWeight: 700, color: "#FFF" }}>Custom Price</span>
                  <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--gold-primary)" }}>
                    ₹{calculatedPrice}
                  </span>
                </div>
              </div>

              {/* Add Custom to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="btn-flame"
                style={{ width: "100%", marginTop: "1.2rem", padding: "0.85rem", fontSize: "1rem", borderRadius: "10px" }}
              >
                <ShoppingBag size={18} /> Add Masterpiece to Cart
              </button>
            </div>
          </div>

          {/* Right Column: Step-by-Step Ingredient Selectors */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
            
            {/* Step 1: Base Crust */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "var(--flame-gradient)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem" }}>
                  1
                </span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFF" }}>
                  Choose Your Dough & Crust
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
                {ingredients.base?.map((b) => {
                  const isSelected = selectedBase?._id === b._id;
                  const isOutOfStock = b.stock === 0;

                  return (
                    <button
                      key={b._id}
                      onClick={() => !isOutOfStock && setSelectedBase(b)}
                      disabled={isOutOfStock}
                      style={{
                        padding: "0.85rem",
                        borderRadius: "12px",
                        background: isSelected ? "rgba(255, 87, 34, 0.15)" : "rgba(255, 255, 255, 0.03)",
                        border: isSelected ? "2px solid var(--flame-primary)" : "1px solid var(--border-glass)",
                        textAlign: "left",
                        cursor: isOutOfStock ? "not-allowed" : "pointer",
                        opacity: isOutOfStock ? 0.45 : 1,
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      <div style={{ fontWeight: 700, color: isSelected ? "var(--flame-primary)" : "#FFF", fontSize: "0.92rem", marginBottom: "4px" }}>
                        {b.name}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                        <span style={{ color: "var(--gold-primary)", fontWeight: 700 }}>₹{b.price}</span>
                        {b.stock <= 20 && b.stock > 0 && (
                          <span style={{ color: "var(--crimson-red)", fontSize: "0.7rem", fontWeight: 700 }}>
                            Low: {b.stock} left
                          </span>
                        )}
                        {isOutOfStock && (
                          <span style={{ color: "var(--crimson-red)", fontSize: "0.7rem", fontWeight: 700 }}>
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Sauce */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "var(--flame-gradient)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem" }}>
                  2
                </span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFF" }}>
                  Select Sauce Base
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
                {ingredients.sauce?.map((s) => {
                  const isSelected = selectedSauce?._id === s._id;
                  const isOutOfStock = s.stock === 0;

                  return (
                    <button
                      key={s._id}
                      onClick={() => !isOutOfStock && setSelectedSauce(s)}
                      disabled={isOutOfStock}
                      style={{
                        padding: "0.85rem",
                        borderRadius: "12px",
                        background: isSelected ? "rgba(255, 87, 34, 0.15)" : "rgba(255, 255, 255, 0.03)",
                        border: isSelected ? "2px solid var(--flame-primary)" : "1px solid var(--border-glass)",
                        textAlign: "left",
                        cursor: isOutOfStock ? "not-allowed" : "pointer",
                        opacity: isOutOfStock ? 0.45 : 1,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: isSelected ? "var(--flame-primary)" : "#FFF", fontSize: "0.92rem", marginBottom: "4px" }}>
                        {s.name}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                        <span style={{ color: "var(--gold-primary)", fontWeight: 700 }}>₹{s.price}</span>
                        {s.stock <= 20 && s.stock > 0 && (
                          <span style={{ color: "var(--crimson-red)", fontSize: "0.7rem", fontWeight: 700 }}>
                            Low: {s.stock}
                          </span>
                        )}
                        {isOutOfStock && (
                          <span style={{ color: "var(--crimson-red)", fontSize: "0.7rem", fontWeight: 700 }}>
                            Sold Out
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Cheese */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "var(--flame-gradient)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem" }}>
                  3
                </span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFF" }}>
                  Choose Melted Cheese
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
                {ingredients.cheese?.map((c) => {
                  const isSelected = selectedCheese?._id === c._id;
                  const isOutOfStock = c.stock === 0;

                  return (
                    <button
                      key={c._id}
                      onClick={() => !isOutOfStock && setSelectedCheese(c)}
                      disabled={isOutOfStock}
                      style={{
                        padding: "0.85rem",
                        borderRadius: "12px",
                        background: isSelected ? "rgba(255, 87, 34, 0.15)" : "rgba(255, 255, 255, 0.03)",
                        border: isSelected ? "2px solid var(--flame-primary)" : "1px solid var(--border-glass)",
                        textAlign: "left",
                        cursor: isOutOfStock ? "not-allowed" : "pointer",
                        opacity: isOutOfStock ? 0.45 : 1,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: isSelected ? "var(--flame-primary)" : "#FFF", fontSize: "0.92rem", marginBottom: "4px" }}>
                        {c.name}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                        <span style={{ color: "var(--gold-primary)", fontWeight: 700 }}>₹{c.price}</span>
                        {c.stock <= 20 && c.stock > 0 && (
                          <span style={{ color: "var(--crimson-red)", fontSize: "0.7rem", fontWeight: 700 }}>
                            Low: {c.stock}
                          </span>
                        )}
                        {isOutOfStock && (
                          <span style={{ color: "var(--crimson-red)", fontSize: "0.7rem", fontWeight: 700 }}>
                            Sold Out
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Fresh Vegetables & Toppings */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "var(--flame-gradient)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem" }}>
                  4
                </span>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFF" }}>
                    Pile on Fresh Garden Veggies
                  </h3>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Select as many as you crave!
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
                {ingredients.vegetable?.map((v) => {
                  const isSelected = selectedVeggies.some((item) => item._id === v._id);
                  const isOutOfStock = v.stock === 0;

                  return (
                    <button
                      key={v._id}
                      onClick={() => !isOutOfStock && handleToggleVeggie(v)}
                      disabled={isOutOfStock}
                      style={{
                        padding: "0.85rem",
                        borderRadius: "12px",
                        background: isSelected ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.03)",
                        border: isSelected ? "2px solid var(--herb-green)" : "1px solid var(--border-glass)",
                        textAlign: "left",
                        cursor: isOutOfStock ? "not-allowed" : "pointer",
                        opacity: isOutOfStock ? 0.45 : 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 700, color: isSelected ? "var(--herb-green)" : "#FFF", fontSize: "0.92rem" }}>
                          {v.name}
                        </span>
                        {isSelected && <Check size={16} color="var(--herb-green)" />}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", marginTop: "4px" }}>
                        <span style={{ color: "var(--gold-primary)", fontWeight: 700 }}>₹{v.price}</span>
                        {v.stock <= 20 && v.stock > 0 && (
                          <span style={{ color: "var(--crimson-red)", fontSize: "0.7rem", fontWeight: 700 }}>
                            Low: {v.stock}
                          </span>
                        )}
                        {isOutOfStock && (
                          <span style={{ color: "var(--crimson-red)", fontSize: "0.7rem", fontWeight: 700 }}>
                            Sold Out
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default BuilderPage;
