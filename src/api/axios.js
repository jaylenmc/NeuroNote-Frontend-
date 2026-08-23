import axios from 'axios';

// Get API URL from environment variable and ensure proper format
const getBaseURL = () => {
  let apiUrl = import.meta.env.API_URL || 'http://localhost:8000/api';
  
  // Remove trailing slash
  apiUrl = apiUrl.replace(/\/$/, '');
  
  // If no protocol is specified, assume https for production, http for localhost
  if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
    // If it's a localhost-like URL, use http, otherwise use https
    if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
      apiUrl = `http://${apiUrl}`;
    } else {
      apiUrl = `https://${apiUrl}`;
    }
  }
  
  // Ensure /api path is included if not already present
  if (!apiUrl.includes('/api')) {
    apiUrl = `${apiUrl}/api`;
  }
  
  return apiUrl;
};

const baseURL = getBaseURL();

// API Base URL configured

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies for cross-site requests
});

// Create a separate axios instance for token refresh to avoid infinite loops
const refreshApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies for cross-site requests
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Function to refresh token
const refreshToken = async () => {
  try {
    const refreshToken = sessionStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.error('No refresh token found in sessionStorage');
      throw new Error('No refresh token available');
    }

    // Send the refresh token in the request body
    const response = await refreshApi.post('/auth/token/refresh/', {
      refresh_token: refreshToken
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const { access } = response.data;
    sessionStorage.setItem('jwt_token', access);
    return access;
  } catch (error) {
    console.error('Token refresh failed:', error.response?.data || error.message);
    console.error('Full error:', error);
    
    // If the refresh token itself is invalid/expired, redirect to login
    if (error.response?.status === 401) {
      sessionStorage.removeItem('jwt_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user');
      window.location.href = '/signin';
    }
    
    throw error;
  }
};

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('jwt_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        processQueue(null, newToken);
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api; 