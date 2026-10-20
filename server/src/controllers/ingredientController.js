
import Ingredient from "../models/Ingredient.js";

export const getIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({
      isAvailable: true,
      stock: { $gt: 0 },
    });

    res.status(200).json({
      success: true,
      count: ingredients.length,
      ingredients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch ingredients",
    });
  }
};
