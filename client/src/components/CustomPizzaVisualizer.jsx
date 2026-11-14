import React from "react";

const CustomPizzaVisualizer = ({ base, sauce, cheese, veggies = [], size = "Medium" }) => {
  // Determine crust styling based on selected base
  const getCrustStyle = () => {
    const baseName = (base?.name || "").toLowerCase();
    if (baseName.includes("whole wheat")) {
      return { background: "#9C6644", borderColor: "#7F4F24", ringGlow: "rgba(156, 102, 68, 0.4)" };
    }
    if (baseName.includes("cheese burst")) {
      return { background: "#E09F3E", borderColor: "#FFF3B0", ringGlow: "rgba(255, 243, 176, 0.8)" };
    }
    if (baseName.includes("multigrain")) {
      return { background: "#A67C52", borderColor: "#8A5A36", ringGlow: "rgba(166, 124, 82, 0.4)" };
    }
    if (baseName.includes("thin")) {
      return { background: "#DDA15E", borderColor: "#BC6C25", ringGlow: "rgba(221, 161, 94, 0.4)" };
    }
    // Default Classic Crust
    return { background: "#DDA15E", borderColor: "#BC6C25", ringGlow: "rgba(221, 161, 94, 0.35)" };
  };

  // Determine sauce coloring based on selected sauce
  const getSauceColor = () => {
    const sauceName = (sauce?.name || "").toLowerCase();
    if (sauceName.includes("spicy")) return "radial-gradient(circle, #B91C1C 0%, #991B1B 70%, #7F1D1D 100%)";
    if (sauceName.includes("pesto")) return "radial-gradient(circle, #15803D 0%, #166534 70%, #14532D 100%)";
    if (sauceName.includes("barbecue")) return "radial-gradient(circle, #541919 0%, #3B1212 70%, #2A0D0D 100%)";
    if (sauceName.includes("white garlic")) return "radial-gradient(circle, #FEF3C7 0%, #FDE68A 70%, #FCD34D 100%)";
    // Default Classic Tomato
    return "radial-gradient(circle, #DC2626 0%, #B91C1C 70%, #991B1B 100%)";
  };

  // Determine cheese color/melt pattern based on cheese
  const getCheeseColor = () => {
    const cheeseName = (cheese?.name || "").toLowerCase();
    if (cheeseName.includes("cheddar")) return "#F59E0B";
    if (cheeseName.includes("parmesan")) return "#FEF08A";
    // Default Mozzarella
    return "#FEF3C7";
  };

  const crust = getCrustStyle();
  const sauceBackground = getSauceColor();
  const cheeseColor = getCheeseColor();

  // Deterministic vegetable positions for aesthetic distribution
  const veggiePositions = [
    { top: "25%", left: "35%" },
    { top: "30%", left: "65%" },
    { top: "50%", left: "25%" },
    { top: "45%", left: "50%" },
    { top: "55%", left: "70%" },
    { top: "70%", left: "38%" },
    { top: "68%", left: "60%" },
    { top: "35%", left: "45%" },
    { top: "58%", left: "48%" },
    { top: "20%", left: "52%" },
    { top: "78%", left: "48%" },
  ];

  const renderVeggieItem = (veg, index) => {
    const vegName = (veg?.name || "").toLowerCase();
    const pos = veggiePositions[index % veggiePositions.length];

    if (vegName.includes("onion")) {
      return (
        <div
          key={`${veg.name}-${index}`}
          style={{
            position: "absolute",
            top: pos.top,
            left: pos.left,
            width: "32px",
            height: "16px",
            border: "3px solid #A855F7",
            borderRadius: "50%",
            transform: `rotate(${index * 42}deg)`,
            opacity: 0.9,
            pointerEvents: "none",
          }}
        />
      );
    }

    if (vegName.includes("capsicum")) {
      return (
        <div
          key={`${veg.name}-${index}`}
          style={{
            position: "absolute",
            top: pos.top,
            left: pos.left,
            width: "28px",
            height: "8px",
            backgroundColor: "#22C55E",
            borderRadius: "4px",
            border: "1px solid #15803D",
            transform: `rotate(${index * 58}deg)`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
            pointerEvents: "none",
          }}
        />
      );
    }

    if (vegName.includes("mushroom")) {
      return (
        <div
          key={`${veg.name}-${index}`}
          style={{
            position: "absolute",
            top: pos.top,
            left: pos.left,
            width: "22px",
            height: "16px",
            backgroundColor: "#D6D3D1",
            borderRadius: "12px 12px 4px 4px",
            border: "2px solid #78716C",
            transform: `rotate(${index * 36}deg)`,
            boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
            pointerEvents: "none",
          }}
        />
      );
    }

    if (vegName.includes("olive")) {
      return (
        <div
          key={`${veg.name}-${index}`}
          style={{
            position: "absolute",
            top: pos.top,
            left: pos.left,
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            backgroundColor: "#18181B",
            border: "4px solid #09090B",
            boxShadow: "0 2px 4px rgba(0,0,0,0.6)",
            pointerEvents: "none",
          }}
        />
      );
    }

    if (vegName.includes("jalape")) {
      return (
        <div
          key={`${veg.name}-${index}`}
          style={{
            position: "absolute",
            top: pos.top,
            left: pos.left,
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "transparent",
            border: "5px solid #16A34A",
            boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
            pointerEvents: "none",
          }}
        />
      );
    }

    if (vegName.includes("corn")) {
      return (
        <div
          key={`${veg.name}-${index}`}
          style={{
            position: "absolute",
            top: pos.top,
            left: pos.left,
            width: "12px",
            height: "14px",
            backgroundColor: "#FACC15",
            borderRadius: "4px",
            border: "1px solid #CA8A04",
            transform: `rotate(${index * 25}deg)`,
            boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
            pointerEvents: "none",
          }}
        />
      );
    }

    // Default generic topping
    return (
      <div
        key={`${veg.name}-${index}`}
        style={{
          position: "absolute",
          top: pos.top,
          left: pos.left,
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          backgroundColor: "#F97316",
          boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
          pointerEvents: "none",
        }}
      />
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      
      {/* Visual Canvas Container */}
      <div
        style={{
          position: "relative",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          boxShadow: "0 20px 45px rgba(0, 0, 0, 0.7), inset 0 2px 10px rgba(255, 255, 255, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: "scale(1)",
        }}
      >
        {/* Layer 1: Outer Crust Rim */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            backgroundColor: crust.background,
            border: `10px solid ${crust.borderColor}`,
            boxShadow: `0 0 20px ${crust.ringGlow}, inset 0 0 15px rgba(0, 0, 0, 0.4)`,
            transition: "all 0.4s ease",
          }}
        />

        {/* Layer 2: Sauce Base */}
        <div
          style={{
            position: "absolute",
            inset: "24px",
            borderRadius: "50%",
            background: sauce ? sauceBackground : "transparent",
            boxShadow: sauce ? "inset 0 0 12px rgba(0, 0, 0, 0.5)" : "none",
            transition: "background 0.4s ease",
          }}
        />

        {/* Layer 3: Melted Cheese */}
        {cheese && (
          <div
            style={{
              position: "absolute",
              inset: "28px",
              borderRadius: "50%",
              backgroundColor: cheeseColor,
              opacity: 0.88,
              boxShadow: "inset 0 0 18px rgba(180, 83, 9, 0.4)",
              backgroundImage: "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.4) 0%, transparent 20%), radial-gradient(circle at 70% 60%, rgba(217, 119, 6, 0.3) 0%, transparent 25%)",
              transition: "all 0.4s ease",
            }}
          />
        )}

        {/* Layer 4: Veggie Toppings */}
        {veggies && veggies.length > 0 && (
          <div style={{ position: "absolute", inset: "30px", borderRadius: "50%", overflow: "hidden" }}>
            {veggies.map((veg, vIdx) => {
              // Scatter 3-4 instances of each topping across different spots
              return [0, 1, 2, 3].map((inst) =>
                renderVeggieItem(veg, vIdx * 4 + inst)
              );
            })}
          </div>
        )}

        {/* Empty state hint */}
        {!sauce && !cheese && veggies.length === 0 && (
          <div
            style={{
              position: "relative",
              zIndex: 10,
              textAlign: "center",
              color: "#FFF",
              fontWeight: 700,
              fontSize: "0.9rem",
              background: "rgba(0,0,0,0.6)",
              padding: "0.5rem 1rem",
              borderRadius: "20px",
            }}
          >
            Select sauce & cheese to start!
          </div>
        )}
      </div>

      {/* Visual Recipe Summary Pill */}
      <div
        style={{
          marginTop: "1.2rem",
          padding: "0.5rem 1rem",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-glass)",
          borderRadius: "var(--radius-full)",
          fontSize: "0.82rem",
          color: "var(--text-secondary)",
          display: "flex",
          gap: "0.6rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <span><strong>Crust:</strong> {base?.name || "None"}</span>
        <span>•</span>
        <span><strong>Sauce:</strong> {sauce?.name || "None"}</span>
        <span>•</span>
        <span><strong>Cheese:</strong> {cheese?.name || "None"}</span>
        {veggies.length > 0 && (
          <>
            <span>•</span>
            <span><strong>Veggies:</strong> {veggies.map((v) => v.name).join(", ")}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomPizzaVisualizer;
