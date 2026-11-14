import "dotenv/config";
import mongoose from "mongoose";
import crypto from "crypto";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Ingredient from "../models/Ingredient.js";
import Pizza from "../models/Pizza.js";
import Order from "../models/Order.js";
import app from "../app.js";
import http from "http";

const runTests = async () => {
  console.log("==================================================");
  console.log("🧪 STARTING COMPREHENSIVE END-TO-END WORKFLOW TEST");
  console.log("==================================================");

  let server;
  const TEST_PORT = 5055;

  try {
    await connectDB();

    // Start ephemeral test server
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(TEST_PORT, resolve));
    console.log(`[Test Server] Running on http://localhost:${TEST_PORT}`);

    const baseUrl = `http://localhost:${TEST_PORT}`;

    // Ensure Admin exists before running login test
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@pizzadelivery.com").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
    const bcrypt = (await import("bcryptjs")).default;
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

    await User.updateOne(
      { email: adminEmail },
      {
        $set: {
          name: "Head Chef Admin",
          email: adminEmail,
          password: hashedAdminPassword,
          role: "admin",
          isEmailVerified: true,
        },
      },
      { upsert: true }
    );

    // Test 1: Health Check
    console.log("\n▶ Test 1: API Health Check");
    const healthRes = await fetch(`${baseUrl}/`).then((r) => r.json());
    if (!healthRes.success) throw new Error("Health check failed");
    console.log("  ✓ API is responding:", healthRes.message);

    // Test 2: Admin Authentication
    console.log("\n▶ Test 2: Admin Authentication");
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL || "admin@pizzadelivery.com",
        password: process.env.ADMIN_PASSWORD || "Admin@12345",
      }),
    }).then((r) => r.json());

    if (!adminLoginRes.success || adminLoginRes.user?.role !== "admin") {
      throw new Error(`Admin login failed: ${adminLoginRes.message}`);
    }
    const adminToken = adminLoginRes.token;
    console.log("  ✓ Admin logged in successfully:", adminLoginRes.user.email);

    // Test 3: Customer Registration & Login
    console.log("\n▶ Test 3: Customer Registration & Login");
    const testEmail = `test_customer_${Date.now()}@test.com`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Foodie Customer",
        email: testEmail,
        password: "Customer@12345",
      }),
    }).then((r) => r.json());

    if (!regRes.success || !regRes.token) {
      throw new Error(`Customer register failed: ${regRes.message}`);
    }
    const customerToken = regRes.token;
    console.log("  ✓ Customer registered & issued JWT token:", testEmail);

    // Test 4: Fetch Menu Pizzas
    console.log("\n▶ Test 4: Fetch Signature Pizzas Catalog");
    const pizzasRes = await fetch(`${baseUrl}/api/pizzas`).then((r) => r.json());
    if (!pizzasRes.success || pizzasRes.pizzas.length === 0) {
      throw new Error("No pizzas returned from menu catalog");
    }
    const samplePizza = pizzasRes.pizzas[0];
    console.log(`  ✓ Retrieved ${pizzasRes.count} pizzas. Sample: "${samplePizza.name}" (₹${samplePizza.price})`);

    // Test 5: Fetch Available Ingredients
    console.log("\n▶ Test 5: Fetch Available Ingredients for Custom Builder");
    const ingredientsRes = await fetch(`${baseUrl}/api/ingredients`).then((r) => r.json());
    if (!ingredientsRes.success || !ingredientsRes.categorized) {
      throw new Error("Failed to fetch ingredients");
    }
    const { base, sauce, cheese, vegetable } = ingredientsRes.categorized;
    console.log(
      `  ✓ Retrieved ingredients: ${base.length} bases, ${sauce.length} sauces, ${cheese.length} cheeses, ${vegetable.length} veggies.`
    );

    const testBase = base[0];
    const testSauce = sauce[0];
    const testCheese = cheese[0];
    const testVeg = vegetable[0];

    // Record initial stock
    const initialBaseStock = testBase.stock;
    console.log(`  ℹ Initial stock for "${testBase.name}": ${initialBaseStock} units`);

    // Test 6: Create Customer Order (Preset Pizza + Custom Pizza)
    console.log("\n▶ Test 6: Create Pending Customer Order");
    const orderPayload = {
      items: [
        {
          itemType: "preset",
          pizza: samplePizza._id,
          name: samplePizza.name,
          size: "Regular",
          quantity: 1,
          itemPrice: samplePizza.price,
        },
        {
          itemType: "custom",
          name: "My Sourdough Masterpiece",
          size: "Medium",
          base: { name: testBase.name, ingredientId: testBase._id, price: testBase.price },
          sauce: { name: testSauce.name, ingredientId: testSauce._id, price: testSauce.price },
          cheese: { name: testCheese.name, ingredientId: testCheese._id, price: testCheese.price },
          veggies: [{ name: testVeg.name, ingredientId: testVeg._id, price: testVeg.price }],
          quantity: 2, // 2 pizzas = should deduct 2 units of testBase, testSauce, testCheese, testVeg
          itemPrice: Math.round((testBase.price + testSauce.price + testCheese.price + testVeg.price) * 1.25),
        },
      ],
      deliveryAddress: {
        fullName: "Test Foodie Customer",
        phone: "9876543210",
        street: "Suite 101, Artisan Avenue",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400001",
        instructions: "Ring buzzer twice",
      },
      paymentMethod: "razorpay",
    };

    const orderRes = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify(orderPayload),
    }).then((r) => r.json());

    if (!orderRes.success || !orderRes.order) {
      throw new Error(`Order placement failed: ${orderRes.message}`);
    }
    const createdOrder = orderRes.order;
    console.log(`  ✓ Order created successfully: #${createdOrder._id.slice(-6).toUpperCase()}`);
    console.log(`  ✓ Subtotal: ₹${createdOrder.subtotal}, Tax: ₹${createdOrder.tax}, Total: ₹${createdOrder.totalAmount}`);
    console.log(`  ✓ Payment Status: ${createdOrder.paymentInfo.status}, Inventory Deducted: ${createdOrder.inventoryDeducted}`);

    // Verify stock is NOT deducted before payment
    const prePayIng = await Ingredient.findById(testBase._id);
    if (prePayIng.stock !== initialBaseStock) {
      throw new Error("Stock was deducted before payment verification!");
    }
    console.log("  ✓ Stock correctly preserved prior to verified payment.");

    // Test 7: Create Razorpay Payment Order
    console.log("\n▶ Test 7: Razorpay Payment Order Initialization");
    const payOrderRes = await fetch(`${baseUrl}/api/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ orderId: createdOrder._id }),
    }).then((r) => r.json());

    if (!payOrderRes.success || !payOrderRes.razorpayOrderId) {
      throw new Error("Failed to create Razorpay payment order");
    }
    console.log(`  ✓ Generated Razorpay Order ID: ${payOrderRes.razorpayOrderId}`);

    // Test 8: Payment Verification & Automatic Inventory Deduction
    console.log("\n▶ Test 8: Payment Signature Verification & Automatic Stock Deduction");
    const testPaymentId = `pay_test_${Date.now()}`;
    const testSecret = process.env.RAZORPAY_KEY_SECRET || "dev_test_secret_998877";
    const validHmacSignature = crypto
      .createHmac("sha256", testSecret)
      .update(`${payOrderRes.razorpayOrderId}|${testPaymentId}`)
      .digest("hex");

    const verifyPayload = {
      orderId: createdOrder._id,
      razorpayOrderId: payOrderRes.razorpayOrderId,
      razorpayPaymentId: testPaymentId,
      razorpaySignature: validHmacSignature,
    };

    const verifyRes = await fetch(`${baseUrl}/api/payments/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify(verifyPayload),
    }).then((r) => r.json());

    if (!verifyRes.success || verifyRes.order.paymentInfo.status !== "completed") {
      throw new Error(`Payment verification failed: ${verifyRes.message}`);
    }
    console.log("  ✓ Payment signature verified successfully!");
    console.log(`  ✓ Order updated to status: "${verifyRes.order.orderStatus}"`);

    // Test 9: Verify Exact Inventory Stock Deduction
    console.log("\n▶ Test 9: Verify Exact Ingredient Deduction");
    const postPayBase = await Ingredient.findById(testBase._id);
    const expectedBaseStock = initialBaseStock - 2; // Quantity 2 custom pizzas
    if (postPayBase.stock !== expectedBaseStock) {
      throw new Error(
        `Inventory stock mismatch! Expected: ${expectedBaseStock}, Found: ${postPayBase.stock}`
      );
    }
    console.log(`  ✓ Stock for "${testBase.name}" correctly decremented from ${initialBaseStock} to ${postPayBase.stock}!`);

    // Test 10: Protection Against Duplicate Deduction
    console.log("\n▶ Test 10: Test Duplicate Deduction Protection");
    const dupRes = await fetch(`${baseUrl}/api/payments/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify(verifyPayload),
    }).then((r) => r.json());

    const postDupBase = await Ingredient.findById(testBase._id);
    if (postDupBase.stock !== expectedBaseStock) {
      throw new Error("Duplicate inventory deduction occurred!");
    }
    console.log("  ✓ Duplicate payment callback safely handled without re-deducting stock.");

    // Test 11: Admin Order Status Transition
    console.log("\n▶ Test 11: Admin Order Status Workflow (In Kitchen -> Out for Delivery -> Delivered)");
    const statusUpdateRes = await fetch(`${baseUrl}/api/orders/${createdOrder._id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        orderStatus: "Out for Delivery",
        note: "Handed over to rider with insulated hot bag.",
      }),
    }).then((r) => r.json());

    if (!statusUpdateRes.success || statusUpdateRes.order.orderStatus !== "Out for Delivery") {
      throw new Error("Admin status update failed");
    }
    console.log("  ✓ Admin updated order status to 'Out for Delivery'");
    console.log(`  ✓ Status history entries recorded: ${statusUpdateRes.order.statusHistory.length}`);

    // Test 12: Admin Inventory Restock
    console.log("\n▶ Test 12: Admin Inventory Restock (+50 units)");
    const restockRes = await fetch(`${baseUrl}/api/ingredients/${testBase._id}/stock`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ delta: 50 }),
    }).then((r) => r.json());

    if (!restockRes.success || restockRes.ingredient.stock !== postDupBase.stock + 50) {
      throw new Error("Admin restock failed");
    }
    console.log(`  ✓ Restocked "${testBase.name}" by +50. New stock: ${restockRes.ingredient.stock}`);

    // Cleanup: Remove test user and test order
    await User.deleteOne({ email: testEmail });
    await Order.deleteOne({ _id: createdOrder._id });
    // Restore base stock
    await Ingredient.updateOne({ _id: testBase._id }, { $set: { stock: initialBaseStock } });
    console.log("  ✓ Cleaned up test artifacts.");

    console.log("\n==================================================");
    console.log("🎉 ALL 12 WORKFLOW TESTS PASSED CLEANLY!");
    console.log("==================================================");
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
};

runTests();
