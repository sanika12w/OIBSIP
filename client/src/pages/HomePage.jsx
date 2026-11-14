import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Sparkles, Clock, ShieldCheck, ArrowRight, Utensils, Heart } from "lucide-react";
import { api } from "../api";
import PizzaCard from "../components/PizzaCard";

const HomePage = () => {
  const [featuredPizzas, setFeaturedPizzas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.pizzas
      .getAll({ category: "all" })
      .then((data) => {
        setFeaturedPizzas(data.pizzas.slice(0, 3));
      })
      .catch((err) => console.error("Failed to load featured pizzas", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          padding: "5rem 0 6rem 0",
          overflow: "hidden",
        }}
      >
        <div className="container" style={{ position: "relative", zIndex: 10 }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
            
            {/* Pill Tag */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(255, 87, 34, 0.12)",
                border: "1px solid rgba(255, 87, 34, 0.35)",
                color: "var(--flame-hover)",
                padding: "0.4rem 1rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.84rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
              }}
            >
              <Flame size={15} className="flame-anim" /> 100% Wood-Fired Neapolitan Craft
            </div>

            <h1
              style={{
                fontSize: "clamp(2.5rem, 5.5vw, 4.2rem)",
                fontWeight: 800,
                lineHeight: 1.12,
                color: "#FFF",
                marginBottom: "1.5rem",
              }}
            >
              Artisan Crusts, <br />
              <span
                style={{
                  background: "var(--flame-gradient)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Infinite Possibilities.
              </span>
            </h1>

            <p
              style={{
                fontSize: "1.15rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: "2.5rem",
                maxWidth: "600px",
                margin: "0 auto 2.5rem auto",
              }}
            >
              Hand-tossed slow fermented dough, San Marzano marinara, and fresh molten cheeses. Assemble your dream custom pizza layer-by-layer with live kitchen tracking.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/builder" className="btn-flame" style={{ padding: "0.9rem 1.8rem", fontSize: "1.05rem", borderRadius: "10px" }}>
                <Sparkles size={18} /> Build Custom Pizza
              </Link>
              <Link to="/menu" className="btn-outline" style={{ padding: "0.9rem 1.8rem", fontSize: "1.05rem", borderRadius: "10px" }}>
                Explore Signature Menu <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ padding: "2rem 0 4rem 0" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <div className="glass-panel" style={{ padding: "1.8rem", textAlign: "center" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "14px",
                  background: "rgba(255, 87, 34, 0.15)",
                  color: "var(--flame-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem auto",
                }}
              >
                <Utensils size={24} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFF", marginBottom: "0.5rem" }}>
                Layered Custom Builder
              </h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                Pick every component: sourdough bases, pestos, cheeses, and garden veggies with real-time dynamic pricing.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: "1.8rem", textAlign: "center" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "14px",
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "var(--gold-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem auto",
                }}
              >
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFF", marginBottom: "0.5rem" }}>
                Real-Time Oven Tracking
              </h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                Watch your pizza travel live from oven baking to rider dispatch through instant WebSocket socket updates.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: "1.8rem", textAlign: "center" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "14px",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "var(--herb-green)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem auto",
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFF", marginBottom: "0.5rem" }}>
                Secured Razorpay Checkout
              </h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                Frictionless payments with HMAC SHA-256 signature verification and automated inventory stock safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Pizzas Section */}
      <section style={{ padding: "3rem 0 5rem 0", borderTop: "1px solid var(--border-glass)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
            <div>
              <div style={{ fontSize: "0.82rem", color: "var(--gold-primary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em" }}>
                Handcrafted By Head Chef
              </div>
              <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#FFF" }}>
                Signature Wood-Fired Pizzas
              </h2>
            </div>
            <Link to="/menu" style={{ color: "var(--flame-hover)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
              View Full Menu <ArrowRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2rem",
            }}
          >
            {featuredPizzas.map((pizza) => (
              <PizzaCard key={pizza._id} pizza={pizza} />
            ))}
          </div>
        </div>
      </section>

      {/* Custom Pizza CTA Banner */}
      <section style={{ padding: "4rem 0" }}>
        <div className="container">
          <div
            className="glass-panel"
            style={{
              padding: "3.5rem 2.5rem",
              borderRadius: "24px",
              background: "linear-gradient(135deg, rgba(230, 74, 25, 0.18) 0%, rgba(19, 19, 25, 0.95) 70%)",
              border: "1px solid rgba(255, 87, 34, 0.3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>👨‍🍳🍕</div>
            <h2 style={{ fontSize: "2.3rem", fontWeight: 800, color: "#FFF", marginBottom: "1rem" }}>
              Be Your Own Master Pizzaiolo
            </h2>
            <p style={{ maxWidth: "600px", color: "var(--text-secondary)", fontSize: "1.05rem", marginBottom: "2rem" }}>
              Choose your crust, spread gourmet basil pesto or spicy arrabbiata sauce, layer with fresh Wisconsin cheddar, and pile on mushrooms, corn, and jalapeños.
            </p>
            <Link to="/builder" className="btn-flame" style={{ padding: "0.9rem 2rem", fontSize: "1.05rem", borderRadius: "10px" }}>
              Open Interactive Pizza Builder <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
