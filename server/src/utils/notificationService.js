import nodemailer from "nodemailer";
import Ingredient from "../models/Ingredient.js";
import { emitLowStockAlert } from "./socket.js";

// In-memory alert log for review and admin UI notification feed
export const recentAlerts = [];

// Get or create Nodemailer transporter
let transporter = null;

export const getTransporter = async () => {
  if (transporter) return transporter;

  const smtpUser = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : "";
  const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim() : "";
  const smtpHost = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
  const isSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

  if (smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    try {
      await transporter.verify();
      console.log(`[Email Service] Connected to configured SMTP server: ${smtpHost}:${smtpPort}`);
    } catch (verifyErr) {
      console.error(`[Email Service] SMTP connection verification failed: ${verifyErr.message}`);
      transporter = null;
      throw new Error(`SMTP configuration error: ${verifyErr.message}`);
    }
  } else {
    // Development / evaluation fallback: provision real Ethereal test mailbox
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Email Service] Ethereal test mailer initialized for ${testAccount.user}`);
    } catch (etherealErr) {
      console.error("[Email Service] Ethereal test account initialization failed:", etherealErr.message);
      throw new Error(
        "SMTP credentials are not configured in server/.env (SMTP_USER and SMTP_PASS) and automated test mailbox initialization failed."
      );
    }
  }

  return transporter;
};

// Check for low-stock ingredients, prevent duplicate emails, and notify
export const checkAndNotifyLowStock = async () => {
  try {
    const defaultThreshold = parseInt(process.env.LOW_STOCK_THRESHOLD) || 20;

    // Find all ingredients currently at or below threshold
    const lowStockItems = await Ingredient.find({
      $expr: { $lte: ["$stock", { $ifNull: ["$threshold", defaultThreshold] }] },
    });

    if (lowStockItems.length === 0) {
      return { count: 0, items: [] };
    }

    // Filter items that haven't received an alert yet for this low-stock cycle
    const itemsNeedingAlert = lowStockItems.filter((i) => !i.lowStockAlertSent);

    // Broadcast live socket alerts to kitchen admin for all low items
    for (const item of lowStockItems) {
      emitLowStockAlert(item);

      const alertRecord = {
        id: `${item._id}_${Date.now()}`,
        ingredientId: item._id,
        name: item.name,
        category: item.category,
        stock: item.stock,
        threshold: item.threshold || defaultThreshold,
        timestamp: new Date(),
        message: `Stock level for "${item.name}" is low (${item.stock} remaining, threshold: ${item.threshold || defaultThreshold}).`,
      };

      recentAlerts.unshift(alertRecord);
      if (recentAlerts.length > 50) recentAlerts.pop();
    }

    // Send email alert ONLY for items that haven't triggered an alert yet
    if (itemsNeedingAlert.length > 0) {
      const mailer = await getTransporter();
      const alertRecipient = process.env.ALERT_EMAIL || "admin@pizzadelivery.com";

      const itemListHtml = itemsNeedingAlert
        .map(
          (i) =>
            `<li><strong>${i.name}</strong> (${i.category}): Current Stock: <span style="color:red; font-weight:bold;">${i.stock}</span> (Threshold: ${i.threshold})</li>`
        )
        .join("");

      const mailOptions = {
        from: `"Pizza Kitchen Pantry" <${process.env.SMTP_USER || "kitchen@pizzadelivery.com"}>`,
        to: alertRecipient,
        subject: `⚠️ Low Stock Alert: ${itemsNeedingAlert.length} ingredient(s) need restocking`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #D84315;">Wood-Fired Kitchen Inventory Alert</h2>
            <p>The following ingredients have fallen below their restocking safety threshold:</p>
            <ul>${itemListHtml}</ul>
            <p>Please log in to the <strong>Kitchen Admin Dashboard</strong> to restock supplies.</p>
          </div>
        `,
      };

      const info = await mailer.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Alert] Low-stock email sent! Preview URL: ${previewUrl}`);
      } else {
        console.log(`[Alert] Low-stock email dispatched to ${alertRecipient}`);
      }

      // Mark items so duplicate emails are prevented until restocked
      for (const item of itemsNeedingAlert) {
        item.lowStockAlertSent = true;
        await item.save();
      }
    } else {
      console.log(`[Inventory Monitor] ${lowStockItems.length} items low; alerts already sent previously.`);
    }

    return {
      count: lowStockItems.length,
      items: lowStockItems,
      newAlertsDispatched: itemsNeedingAlert.length,
    };
  } catch (error) {
    console.error("Low stock check error:", error.message);
    return { error: error.message };
  }
};

// Dispatch email verification link
export const sendVerificationEmail = async (email, token) => {
  try {
    const mailer = await getTransporter();
    const verifyUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email/${token}`;
    const senderAddress =
      process.env.SMTP_FROM ||
      (process.env.SMTP_USER ? `"Fuego & Forno Pizza" <${process.env.SMTP_USER}>` : '"Fuego & Forno Pizza" <welcome@pizzadelivery.com>');

    const mailOptions = {
      from: senderAddress,
      to: email,
      subject: "🍕 Verify your Fuego & Forno Account",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px; background-color: #0B0B0E; color: #F3F4F6; border-radius: 12px;">
          <h2 style="color: #FF5722;">Welcome to Fuego & Forno Artisan Pizza!</h2>
          <p>Please confirm your email address to activate your account and start crafting custom wood-fired pizzas.</p>
          <div style="margin: 24px 0;">
            <a href="${verifyUrl}" style="background-color: #E64A19; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="font-size: 12px; color: #9CA3AF;">Link expires in 24 hours. Or copy and paste: <br/>${verifyUrl}</p>
        </div>
      `,
    };

    const info = await mailer.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`[Auth Email] Verification Email Preview: ${previewUrl}`);
    return { success: true, previewUrl, messageId: info.messageId };
  } catch (err) {
    console.error("[Auth Email] Verification dispatch failed:", err.message);
    throw new Error(`Email verification dispatch failed: ${err.message}`);
  }
};

// Dispatch password reset link
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const mailer = await getTransporter();
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
    const senderAddress =
      process.env.SMTP_FROM ||
      (process.env.SMTP_USER ? `"Fuego & Forno Security" <${process.env.SMTP_USER}>` : '"Fuego & Forno Security" <security@pizzadelivery.com>');

    const mailOptions = {
      from: senderAddress,
      to: email,
      subject: "🔒 Password Reset Request — Fuego & Forno",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 24px; background-color: #0B0B0E; color: #F3F4F6; border-radius: 12px; border: 1px solid rgba(255,87,34,0.3);">
          <h2 style="color: #FF5722; margin-top: 0;">Password Reset Request</h2>
          <p>We received a request to reset your password for your Fuego & Forno Artisan Pizza account.</p>
          <p>Click the button below to choose a new secure password:</p>
          <div style="margin: 28px 0;">
            <a href="${resetUrl}" style="background-color: #E64A19; color: #FFFFFF; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 12px; color: #9CA3AF; line-height: 1.5;">
            This link is valid for <strong>30 minutes</strong> and can only be used once.<br/>
            If you did not request this, you can safely ignore this email — your password will remain unchanged.
          </p>
        </div>
      `,
    };

    const info = await mailer.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Auth Email] Password Reset Email Preview: ${previewUrl}`);
    } else {
      console.log(`[Auth Email] Password reset email successfully sent to ${email}`);
    }
    return { success: true, previewUrl, messageId: info.messageId };
  } catch (err) {
    console.error("[Auth Email] Password reset dispatch failed:", err.message);
    throw new Error(`Password reset email dispatch failed: ${err.message}`);
  }
};
