const API_BASE_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Auth
  async register(data: { name?: string; email: string; password: string }) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Product
  async getProducts() {
    const res = await fetch(`${API_BASE_URL}/products`, {
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  async getProductById(id: string) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  // Order
  async createOrder(data: {
    customerId: string;
    items: { productId: string; quantity: number }[];
  }) {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getOrders() {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  // Customer
  async getCustomer() {
    const res = await fetch(`${API_BASE_URL}/customers`, {
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  async createCustomer(data: { name: string; phone?: string; address?: string }) {
    const res = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateCustomer(data: { name: string; phone: string; address: string }, id: string) {
    const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Product
  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    imageUrl?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateProduct(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteProduct(id: string) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },
};
