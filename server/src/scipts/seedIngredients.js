
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Ingredient from "../models/Ingredient.js";

dotenv.config();

const ingredients = [
  // Bases
  { name: "Classic Crust", category: "base", stock: 100, price: 80 },
  { name: "Thin Crust", category: "base", stock: 80, price: 90 },
  { name: "Whole Wheat Crust", category: "base", stock: 60, price: 100 },
  { name: "Cheese Burst Crust", category: "base", stock: 50, price: 130 },
  { name: "Multigrain Crust", category: "base", stock: 60, price: 110 },

  // Sauces
  { name: "Classic Tomato", category: "sauce", stock: 100, price: 20 },
  { name: "Spicy Tomato", category: "sauce", stock: 80, price: 25 },
  { name: "Pesto Sauce", category: "sauce", stock: 40, price: 40 },
  { name: "Barbecue Sauce", category: "sauce", stock: 50, price: 30 },
  { name: "White Garlic Sauce", category: "sauce", stock: 50, price: 35 },

  // Cheeses
  { name: "Mozzarella", category: "cheese", stock: 100, price: 50 },
  { name: "Cheddar", category: "cheese", stock: 70, price: 45 },
  { name: "Parmesan", category: "cheese", stock: 40, price: 60 },

  // Vegetables
  { name: "Onion", category: "vegetable", stock: 100, price: 15 },
  { name: "Capsicum", category: "vegetable", stock: 100, price: 20 },
  { name: "Mushroom", category: "vegetable", stock: 60, price: 30 },
  { name: "Olives", category: "vegetable", stock: 50, price: 25 },
  { name: "Jalapeños", category: "vegetable", stock: 40, price: 25 },
  { name: "Sweet Corn", category: "vegetable", stock: 80, price: 20 },
];


const seedIngredients = async () => {
  try {
    await connectDB();

    for (const ingredient of ingredients) {
      await Ingredient.updateOne(
        {
          name: ingredient.name,
          category: ingredient.category,
        },
        {
          $setOnInsert: ingredient,
        },
        { upsert: true }
      );
    }

    console.log(`${ingredients.length} ingredients processed successfully.`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedIngredients();
