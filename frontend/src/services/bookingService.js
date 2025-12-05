import api from './api';

export const bookingService = {
  async getBookings() {
    const response = await api.get('/bookings/');
    return response.data;
  },

  async getBooking(id) {
    const response = await api.get(`/bookings/${id}/`);
    return response.data;
  },

  async createBooking(data) {
    const response = await api.post('/bookings/', data);
    return response.data;
  },

  async confirmBooking(id, notes = '') {
    const response = await api.post(`/bookings/${id}/confirm/`, { notes });
    return response.data;
  },

  async cancelBooking(id) {
    const response = await api.post(`/bookings/${id}/cancel/`);
    return response.data;
  },

  async completeBooking(id) {
    const response = await api.post(`/bookings/${id}/complete/`);
    return response.data;
  },

  // Messages
  async getMessages(params = {}) {
    const response = await api.get('/bookings/messages/', { params });
    return response.data;
  },

  async sendMessage(data) {
    const response = await api.post('/bookings/messages/', data);
    return response.data;
  },

  async getConversations() {
    const response = await api.get('/bookings/messages/conversations/');
    return response.data;
  },

  async markMessageRead(id) {
    const response = await api.post(`/bookings/messages/${id}/mark_read/`);
    return response.data;
  },

  // New methods for property viewings
  async scheduleViewing(propertyId, data) {
    const response = await api.post('/bookings/viewings/', {
      property: propertyId,
      ...data
    });
    return response.data;
  },

  async getViewings(params = {}) {
    const response = await api.get('/bookings/viewings/', { params });
    return response.data;
  },

  async getViewingRequests(propertyId) {
    const response = await api.get(`/bookings/viewings/requests/${propertyId}/`);
    return response.data;
  },

  async updateViewingStatus(id, status) {
    const response = await api.patch(`/bookings/viewings/${id}/`, { status });
    return response.data;
  },

  // Enhanced message handling
  async sendPropertyMessage(propertyId, message) {
    const response = await api.post('/bookings/messages/', {
      property: propertyId,
      content: message
    });
    return response.data;
  },

  async getPropertyMessages(propertyId) {
    const response = await api.get(`/bookings/messages/property/${propertyId}/`);
    return response.data;
  },

  // Availability checking
  async checkAvailability(propertyId, date) {
    const response = await api.get(`/bookings/availability/${propertyId}/`, {
      params: { date }
    });
    return response.data;
  }
};
