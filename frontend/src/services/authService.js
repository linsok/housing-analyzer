import api from './api';

export const authService = {
  async login(username, password) {
    const response = await api.post('/auth/token/', { username, password });
    const { access, refresh } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Get user profile
    const userResponse = await api.get('/auth/users/profile/');
    localStorage.setItem('user', JSON.stringify(userResponse.data));
    
    return userResponse.data;
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

  async uploadVerification(formData) {
    const response = await api.post('/auth/users/upload_verification/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
