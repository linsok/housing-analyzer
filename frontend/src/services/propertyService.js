import api from './api';

export const propertyService = {
  async getProperties(params = {}) {
    const response = await api.get('/properties/', { params });
    return response.data;
  },

  async getProperty(id) {
    const response = await api.get(`/properties/${id}/`);
    return response.data;
  },

  async createProperty(data) {
    const response = await api.post('/properties/', data);
    return response.data;
  },

  async updateProperty(id, data) {
    const response = await api.patch(`/properties/${id}/`, data);
    return response.data;
  },

  async deleteProperty(id) {
    await api.delete(`/properties/${id}/`);
  },

  async uploadImages(propertyId, images) {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post(`/properties/${propertyId}/upload_images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async toggleFavorite(propertyId) {
    const response = await api.post(`/properties/${propertyId}/toggle_favorite/`);
    return response.data;
  },

  async getFavorites() {
    const response = await api.get('/properties/favorites/');
    return response.data;
  },

  async getMyProperties() {
    const response = await api.get('/properties/my_properties/');
    return response.data;
  },

  async getRecommended() {
    const response = await api.get('/properties/recommended/');
    return response.data;
  },

  async reportProperty(propertyId, data) {
    const response = await api.post('/properties/reports/', {
      property: propertyId,
      ...data,
    });
    return response.data;
  },
};
