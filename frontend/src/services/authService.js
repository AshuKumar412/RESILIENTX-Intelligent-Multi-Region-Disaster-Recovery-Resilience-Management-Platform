import apiClient from './apiClient';

export const authService = {
  async login(username, password) {
    const response = await apiClient.post('/auth/login', { username, password });
    if (response.data && response.data.token) {
      localStorage.setItem('resilientx_token', response.data.token);
      localStorage.setItem('resilientx_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(registrationData) {
    const response = await apiClient.post('/auth/register', registrationData);
    return response.data;
  },

  async verifyEmailOtp(email, otpCode) {
    const response = await apiClient.post('/auth/verify-otp', { email, otpCode });
    if (response.data && response.data.token) {
      localStorage.setItem('resilientx_token', response.data.token);
      localStorage.setItem('resilientx_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async resendOtp(email) {
    const response = await apiClient.post('/auth/resend-otp', { email });
    return response.data;
  },

  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(email, token, newPassword) {
    const response = await apiClient.post('/auth/reset-password', { email, token, newPassword });
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await apiClient.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    if (response.data) {
      localStorage.setItem('resilientx_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('resilientx_token');
    localStorage.removeItem('resilientx_user');
  },

  getToken() {
    return localStorage.getItem('resilientx_token');
  },

  getStoredUser() {
    try {
      const user = localStorage.getItem('resilientx_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }
};
