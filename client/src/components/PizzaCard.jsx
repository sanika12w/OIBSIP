import React from "react";
import { Plus, Sliders, Sparkles, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const PizzaCard = ({ pizza }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [added, setAdded] = React.useState(false);

  const handleQuickAdd = () => {
    addToCart({
      itemType: "preset",
      pizzaId: pizza._id,
      name: pizza.name,
      description: pizza.description,
      size: "Regular",
      itemPrice: pizza.price,
      price: pizza.price,
      quantity: 1,
      image: pizza.image,
      ingredientsList: pizza.ingredientsList || [],
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleCustomize = () => {
    navigate(`/builder?preset=${pizza._id}`);
  };

  return (
    <div
      className="glass-panel glass-panel-hover"
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        height: "100%",
      }}
    >
      {/* Pizza Image & Badges */}
      <div style={{ position: "relative", width: "100%", height: "210px", overflow: "hidden" }}>
        <img
          src={pizza.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800"}
          alt={pizza.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />

        {/* Top Badges */}
        <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px" }}>
          <span className="badge badge-veg">
            {pizza.category || "Veg"}
          </span>
          {pizza.isBestseller && (
            <span className="badge badge-bestseller">
              <Sparkles size={12} /> Bestseller
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <h3 style={{ fontSize: "1.18rem", fontWeight: 700, color: "#FFF", marginBottom: "0.4rem" }}>
          {pizza.name}
        </h3>

        <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginBottom: "0.9rem", flexGrow: 1, lineHeight: 1.5 }}>
          {pizza.description}
        </p>

        {/* Ingredients tag list */}
        {pizza.ingredientsList && pizza.ingredientsList.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1.1rem" }}>
            {pizza.ingredientsList.map((ing, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: "0.72rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "var(--text-secondary)",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                  border: "1px solid var(--border-glass)",
                }}
              >
                {ing}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Price & Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid var(--border-glass)" }}>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Price</span>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--gold-primary)", lineHeight: 1.1 }}>
              ₹{pizza.price}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleCustomize}
              className="btn-outline btn-sm"
              title="Customize crust, sauce & toppings"
              style={{ padding: "0.5rem", borderRadius: "8px" }}
            >
              <Sliders size={16} />
            </button>

            <button
              onClick={handleQuickAdd}
              className={added ? "btn-flame" : "btn-flame"}
              style={{
                padding: "0.5rem 0.9rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                background: added ? "var(--herb-green)" : undefined,
                boxShadow: added ? "var(--herb-glow)" : undefined,
              }}
            >
              {added ? (
                <>
                  <Check size={16} /> Added
                </>
              ) : (
                <>
                  <Plus size={16} /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzaCard;
