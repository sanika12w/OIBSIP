import Ingredient from "../models/Ingredient.js";

// Public: Get available ingredients in stock
export const getIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({
      isAvailable: true,
      stock: { $gt: 0 },
    }).sort({ category: 1, name: 1 });

    const categorized = {
      base: [],
      sauce: [],
      cheese: [],
      vegetable: [],
    };

    ingredients.forEach((ing) => {
      if (categorized[ing.category]) {
        categorized[ing.category].push(ing);
      }
    });

    res.status(200).json({
      success: true,
      count: ingredients.length,
      ingredients,
      categorized,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch ingredients",
      error: error.message,
    });
  }
};

// Admin: Get all ingredients (including out of stock) with stock alert indicators
export const getAllIngredientsAdmin = async (req, res) => {
  try {
    const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD) || 20;
    const ingredients = await Ingredient.find().sort({ category: 1, name: 1 });

    const enriched = ingredients.map((ing) => {
      const obj = ing.toObject();
      obj.isLowStock = obj.stock <= (obj.threshold || threshold);
      return obj;
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      ingredients: enriched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin ingredients",
      error: error.message,
    });
  }
};

// Admin: Update ingredient stock level
export const updateIngredientStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, delta } = req.body;

    const ingredient = await Ingredient.findById(id);
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found",
      });
    }

    if (typeof stock === "number") {
      ingredient.stock = Math.max(0, Math.floor(stock));
    } else if (typeof delta === "number") {
      ingredient.stock = Math.max(0, ingredient.stock + Math.floor(delta));
    }

    // If restocked above threshold, reset lowStockAlertSent so future drops trigger fresh alerts
    const threshold = ingredient.threshold || parseInt(process.env.LOW_STOCK_THRESHOLD) || 20;
    if (ingredient.stock > threshold) {
      ingredient.lowStockAlertSent = false;
    }

    await ingredient.save();

    res.status(200).json({
      success: true,
      message: `Stock updated for ${ingredient.name}`,
      ingredient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update stock",
      error: error.message,
    });
  }
};

// Admin: Add new ingredient
export const addIngredient = async (req, res) => {
  try {
    const { name, category, stock, price, threshold, isAvailable } = req.body;

    if (!name || !category || stock === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, category, stock, and price are required",
      });
    }

    const ingredient = await Ingredient.create({
      name: name.trim(),
      category,
      stock: parseInt(stock),
      price: parseFloat(price),
      threshold: threshold ? parseInt(threshold) : 20,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      lowStockAlertSent: false,
    });

    res.status(201).json({
      success: true,
      message: "Ingredient added successfully",
      ingredient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add ingredient",
      error: error.message,
    });
  }
};

// Admin: Update ingredient info
export const updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const ingredient = await Ingredient.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found",
      });
    }

    // Reset alert if restocked above threshold
    const threshold = ingredient.threshold || parseInt(process.env.LOW_STOCK_THRESHOLD) || 20;
    if (ingredient.stock > threshold && ingredient.lowStockAlertSent) {
      ingredient.lowStockAlertSent = false;
      await ingredient.save();
    }

    res.status(200).json({
      success: true,
      message: "Ingredient updated successfully",
      ingredient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update ingredient",
      error: error.message,
    });
  }
};

// Admin: Delete ingredient
export const deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const ingredient = await Ingredient.findByIdAndDelete(id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ingredient removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete ingredient",
      error: error.message,
    });
  }
};

// Admin: Get low-stock ingredients
export const getLowStockIngredients = async (req, res) => {
  try {
    const defaultThreshold = parseInt(process.env.LOW_STOCK_THRESHOLD) || 20;
    const ingredients = await Ingredient.find({
      $expr: { $lte: ["$stock", { $ifNull: ["$threshold", defaultThreshold] }] },
    });

    res.status(200).json({
      success: true,
      count: ingredients.length,
      ingredients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check low stock",
      error: error.message,
    });
  }
};
