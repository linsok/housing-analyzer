import api from './api';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create a separate axios instance for public endpoints (no auth required)
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  async login(email, password) {
    console.log('Sending login request with:', { email, password });
    try {
      const response = await api.post('/auth/token/', { 
        email,
        password 
      });
      console.log('Login response:', response.data);
      
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Get user profile
      const userResponse = await api.get('/auth/users/profile/');
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      
      return userResponse.data;
    } catch (error) {
      console.error('Login API error:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw error;
    }
  },

  async register(userData) {
    const response = await api.post('/auth/users/register/', userData);
    return response.data;
  },

  async logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  async updateProfile(data) {
    const response = await api.patch('/auth/users/profile/', data);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/users/profile/');
    return response.data;
  },

  async uploadVerification(formData) {
    const response = await api.post('/auth/users/upload_verification/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async forgotPassword(email) {
    const response = await publicApi.post('/auth/forgot_password/', { email });
    return response.data;
  },

  async verifyOTP(email, otpCode) {
    const response = await publicApi.post('/auth/verify_otp/', { email, otp_code: otpCode });
    return response.data;
  },

  async resetPasswordWithOTP(email, otpCode, newPassword, confirmPassword) {
    const response = await publicApi.post('/auth/reset_password/', {
      email,
      otp_code: otpCode,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    return response.data;
  },
};
