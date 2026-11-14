const API_BASE = "/api";

const getHeaders = (requiresAuth = false) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (requiresAuth) {
    const token = localStorage.getItem("pizza_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Authentication
  auth: {
    login: (credentials) =>
      fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(credentials),
      }).then(handleResponse),

    register: (userData) =>
      fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(userData),
      }).then(handleResponse),

    getMe: () =>
      fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        headers: getHeaders(true),
      }).then(handleResponse),

    updateProfile: (profileData) =>
      fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(profileData),
      }).then(handleResponse),

    forgotPassword: (email) =>
      fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      }).then(handleResponse),

    resetPassword: (payload) =>
      fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then(handleResponse),
  },

  // Pizzas
  pizzas: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_BASE}/pizzas${query ? `?${query}` : ""}`, {
        method: "GET",
        headers: getHeaders(),
      }).then(handleResponse);
    },

    getById: (id) =>
      fetch(`${API_BASE}/pizzas/${id}`, {
        method: "GET",
        headers: getHeaders(),
      }).then(handleResponse),

    getAllAdmin: () =>
      fetch(`${API_BASE}/pizzas/admin/all`, {
        method: "GET",
        headers: getHeaders(true),
      }).then(handleResponse),

    create: (pizzaData) =>
      fetch(`${API_BASE}/pizzas`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(pizzaData),
      }).then(handleResponse),

    update: (id, pizzaData) =>
      fetch(`${API_BASE}/pizzas/${id}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(pizzaData),
      }).then(handleResponse),

    delete: (id) =>
      fetch(`${API_BASE}/pizzas/${id}`, {
        method: "DELETE",
        headers: getHeaders(true),
      }).then(handleResponse),
  },

  // Ingredients (Custom Builder & Admin Inventory)
  ingredients: {
    getAvailable: () =>
      fetch(`${API_BASE}/ingredients`, {
        method: "GET",
        headers: getHeaders(),
      }).then(handleResponse),

    getAllAdmin: () =>
      fetch(`${API_BASE}/ingredients/admin/all`, {
        method: "GET",
        headers: getHeaders(true),
      }).then(handleResponse),

    getLowStock: () =>
      fetch(`${API_BASE}/ingredients/admin/low-stock`, {
        method: "GET",
        headers: getHeaders(true),
      }).then(handleResponse),

    updateStock: (id, payload) =>
      fetch(`${API_BASE}/ingredients/${id}/stock`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
      }).then(handleResponse),

    update: (id, payload) =>
      fetch(`${API_BASE}/ingredients/${id}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
      }).then(handleResponse),

    create: (payload) =>
      fetch(`${API_BASE}/ingredients`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
      }).then(handleResponse),

    delete: (id) =>
      fetch(`${API_BASE}/ingredients/${id}`, {
        method: "DELETE",
        headers: getHeaders(true),
      }).then(handleResponse),
  },

  // Orders
  orders: {
    create: (orderData) =>
      fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(orderData),
      }).then(handleResponse),

    getMyOrders: () =>
      fetch(`${API_BASE}/orders/my-orders`, {
        method: "GET",
        headers: getHeaders(true),
      }).then(handleResponse),

    getById: (id) =>
      fetch(`${API_BASE}/orders/${id}`, {
        method: "GET",
        headers: getHeaders(true),
      }).then(handleResponse),

    getAllAdmin: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_BASE}/orders/admin/all${query ? `?${query}` : ""}`, {
        method: "GET",
        headers: getHeaders(true),
      }).then(handleResponse);
    },

    updateStatusAdmin: (id, payload) =>
      fetch(`${API_BASE}/orders/${id}/status`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
      }).then(handleResponse),
  },

  // Payments (Razorpay & Verified Webhooks)
  payments: {
    getConfig: () =>
      fetch(`${API_BASE}/payments/config`, {
        method: "GET",
        headers: getHeaders(true),
      }).then(handleResponse),

    createPaymentOrder: (orderId) =>
      fetch(`${API_BASE}/payments/create-order`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({ orderId }),
      }).then(handleResponse),

    verifyPayment: (payload) =>
      fetch(`${API_BASE}/payments/verify`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
      }).then(handleResponse),
  },
};
