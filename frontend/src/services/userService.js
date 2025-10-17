import api from './api';

export const userService = {
  async getProfile() {
    const response = await api.get('/auth/users/profile/');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.patch('/auth/users/profile/', data);
    return response.data;
  },

  async updateProfilePicture(file) {
    const formData = new FormData();
    formData.append('profile_picture', file);
    
    const response = await api.patch('/auth/users/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async changePassword(data) {
    const response = await api.post('/auth/users/change_password/', data);
    return response.data;
  },

  async getPreferences() {
    const response = await api.get('/auth/preferences/my_preferences/');
    return response.data;
  },

  async updatePreferences(data) {
    const response = await api.patch('/auth/preferences/my_preferences/', data);
    return response.data;
  },

  async uploadVerificationDocuments(data) {
    const formData = new FormData();
    if (data.id_document) {
      formData.append('id_document', data.id_document);
    }
    if (data.business_license) {
      formData.append('business_license', data.business_license);
    }

    const response = await api.post('/auth/users/upload_verification/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
