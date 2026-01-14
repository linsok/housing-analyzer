import api from './api';

export const reviewService = {
  async getReviews(propertyId = null) {
    const params = propertyId ? { property: propertyId } : {};
    const response = await api.get('/reviews/', { params });
    return response.data;
  },

  async createReview(data) {
    const response = await api.post('/reviews/', data);
    return response.data;
  },

  async updateReview(reviewId, data) {
    console.log('reviewService.updateReview called with:', { reviewId, data });
    const response = await api.put(`/reviews/${reviewId}/`, data);
    return response.data;
  },

  async respondToReview(reviewId, ownerResponse) {
    const response = await api.post(`/reviews/${reviewId}/respond/`, { owner_response: ownerResponse });
    return response.data;
  },
};
