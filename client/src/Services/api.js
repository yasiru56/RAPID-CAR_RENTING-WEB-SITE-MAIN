import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include auth token with every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors globally
    if (error.response && error.response.status === 401) {
      // Redirect to login or dispatch logout action
      console.log('Session expired. Redirecting to login...');
      // window.location.href = '/owner/login';
    }
    return Promise.reject(error);
  }
);

export default api;