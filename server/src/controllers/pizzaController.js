import Pizza from "../models/Pizza.js";

// Public: Get all available pizzas
export const getPizzas = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isAvailable: true };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const pizzas = await Pizza.find(filter).sort({ isBestseller: -1, name: 1 });

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
      error: error.message,
    });
  }
};

// Public: Get pizza by ID
export const getPizzaById = async (req, res) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found",
      });
    }

    res.status(200).json({
      success: true,
      pizza,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pizza details",
      error: error.message,
    });
  }
};

// Admin: Get all pizzas (including unavailable)
export const getAllPizzasAdmin = async (req, res) => {
  try {
    const pizzas = await Pizza.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: pizzas.length,
      pizzas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pizzas for admin",
      error: error.message,
    });
  }
};

// Admin: Create new pizza
export const createPizza = async (req, res) => {
  try {
    const { name, description, price, image, category, ingredientsList, isBestseller, isAvailable } = req.body;

    if (!name || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and price are required",
      });
    }

    const pizza = await Pizza.create({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      image: image || "",
      category: category || "veg",
      ingredientsList: Array.isArray(ingredientsList) ? ingredientsList : [],
      isBestseller: Boolean(isBestseller),
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    });

    res.status(201).json({
      success: true,
      message: "Pizza created successfully",
      pizza,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create pizza",
      error: error.message,
    });
  }
};

// Admin: Update pizza
export const updatePizza = async (req, res) => {
  try {
    const pizza = await Pizza.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pizza updated successfully",
      pizza,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update pizza",
      error: error.message,
    });
  }
};

// Admin: Delete pizza
export const deletePizza = async (req, res) => {
  try {
    const pizza = await Pizza.findByIdAndDelete(req.params.id);
    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pizza deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete pizza",
      error: error.message,
    });
  }
};
