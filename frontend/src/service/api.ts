import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Delay 2 detik untuk semua API calls (agar loading state terlihat)
const API_DELAY_MS = 2000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const withDelay = async <T>(promise: Promise<T>): Promise<T> => {
  const [result] = await Promise.all([promise, delay(API_DELAY_MS)]);
  return result;
};

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Auth
  async register(data: { name?: string; email: string; password: string }) {
    const res = await axios.post(`${API_BASE_URL}/auth/register`, data);
    return withDelay(Promise.resolve(res.data));
  },

  async login(data: { email: string; password: string }) {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, data);
    return withDelay(Promise.resolve(res.data));
  },

  // Product
  async getProducts() {
    const res = await axios.get(`${API_BASE_URL}/products`, {
      headers: { ...getAuthHeader() },
    });
    return withDelay(Promise.resolve(res.data));
  },

  async getProductById(id: string) {
    const res = await axios.get(`${API_BASE_URL}/products/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return withDelay(Promise.resolve(res.data));
  },

  // Order
  async createOrder(data: {
    customerId: string;
    items: { productId: string; quantity: number }[];
    paymentType?: string;
    voucherCode?: string;
  }) {
    const res = await axios.post(`${API_BASE_URL}/orders`, data, {
      headers: { ...getAuthHeader() },
    });
    return withDelay(Promise.resolve(res.data));
  },

  async getOrders() {
    const res = await axios.get(`${API_BASE_URL}/orders`, {
      headers: { ...getAuthHeader() },
    });
    return withDelay(Promise.resolve(res.data));
  },

  async getOrderReceipt(id: string) {
    const res = await axios.get(`${API_BASE_URL}/orders/${id}/receipt`, {
      headers: { ...getAuthHeader() },
    });
    return withDelay(Promise.resolve(res.data));
  },

  // Customer
  async getCustomer() {
    const res = await axios.get(`${API_BASE_URL}/customers`, {
      headers: { ...getAuthHeader() },
    });
    return withDelay(Promise.resolve(res.data));
  },

  async createCustomer(data: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    isMember?: boolean;
  }) {
    const res = await axios.post(`${API_BASE_URL}/customers`, data, {
      headers: { ...getAuthHeader() },
    });
    return withDelay(Promise.resolve(res.data));
  },

  async updateCustomer(data: { name: string; phone: string; address: string }, id: string) {
    const res = await axios.put(`${API_BASE_URL}/customers/${id}`, data, {
      headers: { ...getAuthHeader() },
    });
    return withDelay(Promise.resolve(res.data));
  },

  // Product admin
  async createProduct(formData: FormData) {
    const res = await axios.post(`${API_BASE_URL}/products`, formData, {
      headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' },
    });
    return withDelay(Promise.resolve(res.data));
  },

  async updateProduct(id: string, formData: FormData) {
    const res = await axios.put(`${API_BASE_URL}/products/${id}`, formData, {
      headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' },
    });
    return withDelay(Promise.resolve(res.data));
  },

  async deleteProduct(id: string) {
    const res = await axios.delete(`${API_BASE_URL}/products/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return withDelay(Promise.resolve(res.data));
  },

  // Dashboard
  async getDashboardStats() {
    const res = await axios.get(`${API_BASE_URL}/dashboard`, {
      headers: { ...getAuthHeader() },
    });
    return withDelay(Promise.resolve(res.data));
  },

  // Voucher
  async getVouchers() {
    const res = await axios.get(`${API_BASE_URL}/vouchers`, {
      headers: { ...getAuthHeader() },
    });
    return withDelay(Promise.resolve(res.data));
  },

  async createVoucher(data: {
    code: string;
    type: 'FIXED' | 'PERCENT';
    value: number;
    minPurchase?: number;
    maxDiscount?: number;
    quota?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  }) {
    const res = await axios.post(`${API_BASE_URL}/vouchers`, data, {
      headers: { ...getAuthHeader() },
    });
    return withDelay(Promise.resolve(res.data));
  },

  async updateVoucher(
    id: string,
    data: {
      code?: string;
      type?: 'FIXED' | 'PERCENT';
      value?: number;
      minPurchase?: number;
      maxDiscount?: number;
      quota?: number;
      startDate?: string;
      endDate?: string;
      isActive?: boolean;
    }
  ) {
    const res = await axios.put(`${API_BASE_URL}/vouchers/${id}`, data, {
      headers: { ...getAuthHeader() },
    });
    return withDelay(Promise.resolve(res.data));
  },

  async deleteVoucher(id: string) {
    const res = await axios.delete(`${API_BASE_URL}/vouchers/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return withDelay(Promise.resolve(res.data));
  },
};
