import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["base", "sauce", "cheese", "vegetable"],
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    threshold: {
      type: Number,
      default: 20,
      min: 0,
    },

    unit: {
      type: String,
      default: "units",
    },

    image: {
      type: String,
      default: "",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    // Tracks whether low-stock notification has been dispatched to avoid duplicate alerts
    lowStockAlertSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Ingredient = mongoose.model("Ingredient", ingredientSchema);

export default Ingredient;
