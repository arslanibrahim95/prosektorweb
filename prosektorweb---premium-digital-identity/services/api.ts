import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor - add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      // Optionally redirect to login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name?: string; phone?: string }) =>
    api.post('/auth/register', data),

  verifyCode: (email: string, code: string) =>
    api.post('/auth/verify-code', { email, code }),

  me: () => api.get('/auth/me'),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// AI API
export const aiAPI = {
  analyzeIndustry: (industry: string) =>
    api.post('/ai/analyze-industry', { industry }),
};

// Orders API
export const ordersAPI = {
  create: (designTheme: string, industry: string) =>
    api.post('/orders/create', { designTheme, industry }),

  get: (id: string) => api.get(`/orders/${id}`),

  getMyOrders: () => api.get('/orders/my-orders/list'),
};

// Payment API
export const paymentAPI = {
  createCheckout: (orderId: string) =>
    api.post('/payment/create-checkout-session', { orderId }),
};

export default api;
