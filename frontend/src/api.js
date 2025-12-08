import axios from 'axios';

// Create a base axios instance that we can use everywhere in our app.
// This tells axios: "Whenever I make a request, start with this base URL."
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add auth token to requests (same as api.ts)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-handle invalid/expired tokens
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    if (status === 401 || status === 403 || message === 'Invalid or expired token') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password, otp) => {
    const { data } = await API.post('/auth/login', { email, password, otp });
    return data;
  },
  register: async (userData) => {
    const { data } = await API.post('/auth/register', userData);
    return data;
  },
  updateProfile: async (userData) => {
    const { data } = await API.put('/auth/profile', userData);
    return data;
  },
  mfaSetup: async () => {
    const { data } = await API.post('/auth/mfa/setup');
    return data;
  },
  mfaVerify: async (otp) => {
    const { data } = await API.post('/auth/mfa/verify', { otp });
    return data;
  },
  mfaDisable: async () => {
    const { data } = await API.post('/auth/mfa/disable');
    return data;
  },
};

// Users API (Admin only)
export const usersAPI = {
    getAll: async () => {
        const { data } = await API.get('/users');
        return data;
    },
    create: async (userData) => {
        const { data } = await API.post('/users', userData);
        return data;
    },
    update: async (id, userData) => {
        const { data } = await API.put(`/users/${id}`, userData);
        return data;
    },
    delete: async (id) => {
        const { data } = await API.delete(`/users/${id}`);
        return data;
    },
};

// Activity Logs API
export const activityLogsAPI = {
    getAll: async (params) => {
        const { data } = await API.get('/activity-logs', { params });
        return data;
    },
    getStats: async () => {
        const { data } = await API.get('/activity-logs/stats');
        return data;
    },
};

export default API;





