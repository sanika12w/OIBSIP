
import Pizza from "../models/Pizza.js";

export const getPizzas = async (req, res) => {
  try {
    const pizzas = await Pizza.find({
      isAvailable: true,
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: pizzas.length,
      pizzas,
    });
  } catch (error) {
    console.error("Failed to fetch pizzas:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pizzas",
    });
  }
};
