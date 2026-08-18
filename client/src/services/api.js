import axios from 'axios';
import config from '../config';

const API_BASE_URL = config.API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Menu API calls
export const menuAPI = {
  getAllItems: () => api.get('/menu'),
  createItem: (itemData) => api.post('/menu', itemData),
  updateItem: (id, itemData) => api.put(`/menu/${id}`, itemData),
  deleteItem: (id) => api.delete(`/menu/${id}`),
};

// Review API calls
export const reviewAPI = {
  getReviews: (menuItemId) => api.get(`/reviews/menu/${menuItemId}`),
  addReview: (reviewData) => api.post('/reviews', reviewData),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

// Favorites API calls
export const favoriteAPI = {
  getFavorites: () => api.get('/favorites'),
  addToFavorites: (menuItemId) => api.post('/favorites', { menuItemId }),
  removeFromFavorites: (menuItemId) => api.delete(`/favorites/${menuItemId}`),
  checkIsFavorite: (menuItemId) => api.get(`/favorites/check/${menuItemId}`),
};

export default api;