import mongoose from "mongoose";

const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      enum: ["veg", "non-veg", "specialty", "artisan"],
      default: "veg",
    },

    ingredientsList: {
      type: [String],
      default: [],
    },

    isBestseller: {
      type: Boolean,
      default: false,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Pizza = mongoose.model("Pizza", pizzaSchema);

export default Pizza;
