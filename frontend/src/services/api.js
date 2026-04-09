import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` 
  : 'http://localhost:5000/api';

const getGuestId = () => {
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    const randomPart = Math.random().toString(36).slice(2, 10);
    guestId = `guest_${Date.now()}_${randomPart}`;
    localStorage.setItem('guestId', guestId);
  }
  return guestId;
};

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['x-guest-id'] = getGuestId();
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Product API
export const productAPI = {
  getAllProducts: (params) => api.get('/products', { params }),
  getProductsByCategory: (category, params) => api.get(`/products/category/${category}`, { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  searchProducts: (query) => api.get(`/products/search?q=${query}`),
  createProduct: (productData) => {
    const isFormData = typeof FormData !== 'undefined' && productData instanceof FormData;
    return api.post('/products', productData, isFormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : undefined);
  },
  updateProduct: (id, productData) => {
    const isFormData = typeof FormData !== 'undefined' && productData instanceof FormData;
    return api.put(`/products/${id}`, productData, isFormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : undefined);
  },
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart', { skipAuth: true }),
  addToCart: (productId, quantity, options) => {
    const data = { productId, quantity };
    if (options?.size) data.size = options.size;
    if (options?.flavour) data.flavour = options.flavour;
    return api.post('/cart', data, { skipAuth: true });
  },
  updateCartItem: (productId, quantity) => 
    api.put(`/cart/${productId}`, { quantity }, { skipAuth: true }),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`, { skipAuth: true }),
  clearCart: () => api.delete('/cart', { skipAuth: true }),
};

// User API
export const userAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  blockUser: (id) => api.put(`/users/block/${id}`),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Order API
export const orderAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: () => api.get('/orders/user'),
  getOrdersByUser: (userId) => api.get(`/orders/user/${userId}`),
  getAllOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Review API
export const reviewAPI = {
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  addReview: (reviewData) => api.post('/reviews', reviewData),
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

export default api;
