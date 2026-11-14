import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Contexts
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SocketProvider } from "./context/SocketContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import BuilderPage from "./pages/BuilderPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderTrackPage from "./pages/OrderTrackPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
              }}
            >
              {/* Header Navigation */}
              <Navbar />

              {/* Cart Drawer Overlay */}
              <CartDrawer />

              {/* Page Body */}
              <main style={{ flexGrow: 1 }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/builder" element={<BuilderPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                  <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

                  {/* Customer Protected Routes */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/track/:id"
                    element={
                      <ProtectedRoute>
                        <OrderTrackPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-orders"
                    element={
                      <ProtectedRoute>
                        <MyOrdersPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Command Dashboard & Dedicated Login */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Footer */}
              <Footer />
            </div>
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
