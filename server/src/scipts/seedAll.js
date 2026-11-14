import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import Ingredient from "../models/Ingredient.js";
import Pizza from "../models/Pizza.js";
import User from "../models/User.js";

const ingredients = [
  // Bases
  { name: "Classic Crust", category: "base", stock: 100, price: 80, threshold: 20 },
  { name: "Thin Crust", category: "base", stock: 80, price: 90, threshold: 20 },
  { name: "Whole Wheat Crust", category: "base", stock: 60, price: 100, threshold: 15 },
  { name: "Cheese Burst Crust", category: "base", stock: 50, price: 130, threshold: 15 },
  { name: "Multigrain Crust", category: "base", stock: 60, price: 110, threshold: 15 },

  // Sauces
  { name: "Classic Tomato", category: "sauce", stock: 100, price: 20, threshold: 25 },
  { name: "Spicy Tomato", category: "sauce", stock: 80, price: 25, threshold: 20 },
  { name: "Pesto Sauce", category: "sauce", stock: 40, price: 40, threshold: 15 },
  { name: "Barbecue Sauce", category: "sauce", stock: 50, price: 30, threshold: 15 },
  { name: "White Garlic Sauce", category: "sauce", stock: 50, price: 35, threshold: 15 },

  // Cheeses
  { name: "Mozzarella", category: "cheese", stock: 100, price: 50, threshold: 30 },
  { name: "Cheddar", category: "cheese", stock: 70, price: 45, threshold: 20 },
  { name: "Parmesan", category: "cheese", stock: 40, price: 60, threshold: 15 },

  // Vegetables
  { name: "Onion", category: "vegetable", stock: 100, price: 15, threshold: 25 },
  { name: "Capsicum", category: "vegetable", stock: 100, price: 20, threshold: 25 },
  { name: "Mushroom", category: "vegetable", stock: 60, price: 30, threshold: 20 },
  { name: "Olives", category: "vegetable", stock: 50, price: 25, threshold: 15 },
  { name: "Jalapeños", category: "vegetable", stock: 40, price: 25, threshold: 15 },
  { name: "Sweet Corn", category: "vegetable", stock: 80, price: 20, threshold: 20 },
];

const pizzas = [
  {
    name: "Classic Margherita",
    description: "Authentic Neapolitan sourdough crust topped with San Marzano tomato sauce, fresh mozzarella, and aromatic basil.",
    price: 249,
    image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80",
    category: "veg",
    ingredientsList: ["Classic Crust", "Classic Tomato", "Mozzarella"],
    isBestseller: true,
    isAvailable: true,
  },
  {
    name: "Farmhouse Garden Feast",
    description: "Crispy thin crust layered with spicy tomato sauce, crunchy bell peppers, red onions, mushrooms, and golden sweet corn.",
    price: 349,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    category: "veg",
    ingredientsList: ["Thin Crust", "Spicy Tomato", "Mozzarella", "Onion", "Capsicum", "Mushroom", "Sweet Corn"],
    isBestseller: true,
    isAvailable: true,
  },
  {
    name: "Smoky Barbecue Paneer",
    description: "Tender marinated paneer cubes tossed in rich barbecue sauce, smoked cheddar, jalapeños, and caramelized onions on cheese burst crust.",
    price: 419,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
    category: "specialty",
    ingredientsList: ["Cheese Burst Crust", "Barbecue Sauce", "Cheddar", "Onion", "Jalapeños"],
    isBestseller: true,
    isAvailable: true,
  },
  {
    name: "Wild Truffle & Mushroom",
    description: "Gourmet whole wheat crust, velvety white garlic sauce, button mushrooms, black olives, finished with shaved parmesan.",
    price: 449,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80",
    category: "artisan",
    ingredientsList: ["Whole Wheat Crust", "White Garlic Sauce", "Parmesan", "Mushroom", "Olives"],
    isBestseller: false,
    isAvailable: true,
  },
  {
    name: "Pesto Verde Genovese",
    description: "Handcrafted multigrain base smothered with fragrant basil pesto sauce, fresh mozzarella, sun-ripened olives, and sweet corn.",
    price: 389,
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&auto=format&fit=crop&q=80",
    category: "artisan",
    ingredientsList: ["Multigrain Crust", "Pesto Sauce", "Mozzarella", "Olives", "Sweet Corn"],
    isBestseller: false,
    isAvailable: true,
  },
  {
    name: "Fiery Jalapeño Crunch",
    description: "Spicy tomato sauce, molten cheddar, pickled jalapeños, red onions, and crisp capsicum on classic dough with chili flakes.",
    price: 299,
    image: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=800&auto=format&fit=crop&q=80",
    category: "veg",
    ingredientsList: ["Classic Crust", "Spicy Tomato", "Cheddar", "Jalapeños", "Onion", "Capsicum"],
    isBestseller: false,
    isAvailable: true,
  },
];

const seedAll = async () => {
  try {
    await connectDB();

    console.log("Seeding ingredients...");
    for (const ing of ingredients) {
      await Ingredient.updateOne(
        { name: ing.name, category: ing.category },
        { $set: ing },
        { upsert: true }
      );
    }
    console.log(`✅ ${ingredients.length} ingredients seeded successfully.`);

    console.log("Seeding pre-made pizzas...");
    for (const pizza of pizzas) {
      await Pizza.updateOne(
        { name: pizza.name },
        { $set: pizza },
        { upsert: true }
      );
    }
    console.log(`✅ ${pizzas.length} artisan pizzas seeded successfully.`);

    console.log("Ensuring admin user...");
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@pizzadelivery.com").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await User.updateOne(
      { email: adminEmail },
      {
        $set: {
          name: "Head Chef Admin",
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
          isEmailVerified: true,
        },
      },
      { upsert: true }
    );
    console.log(`✅ Admin account seeded: ${adminEmail} (password: ${adminPassword})`);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedAll();
