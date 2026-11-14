import React, { useEffect, useState } from "react";
import { Search, Filter, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api";
import PizzaCard from "../components/PizzaCard";

const MenuPage = () => {
  const [pizzas, setPizzas] = useState([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPizzas();
  }, [category, search]);

  const fetchPizzas = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== "all") params.category = category;
      if (search.trim()) params.search = search.trim();

      const data = await api.pizzas.getAll(params);
      setPizzas(data.pizzas || []);
    } catch (err) {
      console.error("Failed to load pizzas:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", label: "All Creations" },
    { id: "veg", label: "Garden Veg" },
    { id: "specialty", label: "Chef's Specialty" },
    { id: "artisan", label: "Artisan Gourmet" },
  ];

  return (
    <div style={{ padding: "3rem 0 6rem 0" }}>
      <div className="container">
        
        {/* Header Title */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--gold-primary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "0.4rem" }}>
            Authentic Wood-Fired Recipes
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, color: "#FFF", marginBottom: "0.8rem" }}>
            Signature Pizza Catalog
          </h1>
          <p style={{ color: "var(--text-secondary)", maxWidth: "560px", margin: "0 auto" }}>
            Crafted with cold-fermented dough and baked in 450°C stone ovens. Order directly or customize each recipe to your liking.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "2.5rem",
            padding: "1rem 1.25rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--radius-md)",
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                style={{
                  background: category === cat.id ? "var(--flame-gradient)" : "rgba(255, 255, 255, 0.04)",
                  color: category === cat.id ? "#FFF" : "var(--text-secondary)",
                  border: category === cat.id ? "none" : "1px solid var(--border-glass)",
                  padding: "0.45rem 1rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: "relative", minWidth: "260px" }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search pizzas or ingredients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "2.4rem", fontSize: "0.88rem", padding: "0.55rem 0.85rem 0.55rem 2.4rem" }}
            />
          </div>
        </div>

        {/* Pizza Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }} className="spin-slow">🍕</div>
            <p>Gathering fresh ingredients...</p>
          </div>
        ) : pizzas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              No pizzas found matching your query.
            </p>
            <button
              onClick={() => {
                setCategory("all");
                setSearch("");
              }}
              className="btn-outline btn-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "2rem",
            }}
          >
            {pizzas.map((pizza) => (
              <PizzaCard key={pizza._id} pizza={pizza} />
            ))}
          </div>
        )}

        {/* Custom Builder Banner */}
        <div
          style={{
            marginTop: "4.5rem",
            padding: "2rem",
            borderRadius: "16px",
            background: "rgba(255, 179, 0, 0.08)",
            border: "1px solid rgba(255, 179, 0, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--gold-primary)", marginBottom: "0.3rem" }}>
              Looking for something completely custom?
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
              Design every single bite with our interactive step-by-step dough, sauce, cheese & vegetable builder.
            </p>
          </div>
          <Link to="/builder" className="btn-flame">
            <Sparkles size={16} /> Open Customizer
          </Link>
        </div>

      </div>
    </div>
  );
};

export default MenuPage;
