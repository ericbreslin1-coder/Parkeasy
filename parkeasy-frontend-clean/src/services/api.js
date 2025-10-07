// Shared API client with token injection & helpers
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

const sanitize = (s) => typeof s === 'string' ? s.trim().replace(/[<>]/g, '') : s;

export const authAPI = {
  register: (data) => api.post('/auth/register', { ...data, name: sanitize(data.name), email: data.email?.toLowerCase().trim() }),
  login: (creds) => api.post('/auth/login', { ...creds, email: creds.email?.toLowerCase().trim() }),
  profile: () => api.get('/auth/profile'),
};

export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  users: () => api.get('/admin/users'),
  reviews: () => api.get('/admin/reviews'),
  spots: () => api.get('/admin/parking-spots'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  deleteSpot: (id) => api.delete(`/admin/parking-spots/${id}`),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
};

export const parkingAPI = {
  list: (params={}) => api.get('/parking', { params }),
  get: (id) => api.get(`/parking/${id}`),
  create: (data) => api.post('/parking', data),
  update: (id, data) => api.put(`/parking/${id}`, data),
  remove: (id) => api.delete(`/parking/${id}`),
};

export const reviewsAPI = {
  forSpot: (spotId) => api.get(`/reviews/spot/${spotId}`),
  average: (spotId) => api.get(`/reviews/spot/${spotId}/average`),
  mine: () => api.get('/reviews/user/my-reviews'),
  create: (data) => api.post('/reviews', { ...data, comment: sanitize(data.comment) }),
  update: (id, data) => api.put(`/reviews/${id}`, { ...data, comment: sanitize(data.comment) }),
  remove: (id) => api.delete(`/reviews/${id}`),
};

export default api;
