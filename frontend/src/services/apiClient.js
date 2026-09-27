import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Inject JWT & Correlation ID
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('resilientx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!config.headers['X-Correlation-ID']) {
      config.headers['X-Correlation-ID'] = 'RX-' + crypto.randomUUID();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if on login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('resilientx_token');
        localStorage.removeItem('resilientx_user');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
