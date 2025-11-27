import axios from 'axios';

// Create a base axios instance that we can use everywhere in our app.
// This tells axios: "Whenever I make a request, start with this base URL."
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend server URL
});

// Add auth token to requests (same as api.ts)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;





