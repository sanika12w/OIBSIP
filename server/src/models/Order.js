import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ["preset", "custom"],
    default: "preset",
  },
  pizza: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pizza",
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    enum: ["Regular", "Medium", "Large"],
    default: "Regular",
  },
  // Customization specifications
  base: {
    name: { type: String, default: "" },
    ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient", default: null },
    price: { type: Number, default: 0 },
  },
  sauce: {
    name: { type: String, default: "" },
    ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient", default: null },
    price: { type: Number, default: 0 },
  },
  cheese: {
    name: { type: String, default: "" },
    ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient", default: null },
    price: { type: Number, default: 0 },
  },
  veggies: [
    {
      name: { type: String, default: "" },
      ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient", default: null },
      price: { type: Number, default: 0 },
    },
  ],
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  itemPrice: {
    type: Number,
    required: true,
    min: 0,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (items) => items && items.length > 0,
        "Order must contain at least one item",
      ],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 40,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: "" },
      zipCode: { type: String, required: true },
      instructions: { type: String, default: "" },
    },
    paymentInfo: {
      method: {
        type: String,
        enum: ["razorpay", "card", "upi", "cod"],
        default: "razorpay",
      },
      razorpayOrderId: { type: String, default: "" },
      razorpayPaymentId: { type: String, default: "" },
      razorpaySignature: { type: String, default: "" },
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
      paidAt: { type: Date, default: null },
    },
    orderStatus: {
      type: String,
      enum: [
        "Order Placed",
        "Baking in Oven",
        "In Kitchen",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Order Placed",
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: "" },
      },
    ],
    inventoryDeducted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
