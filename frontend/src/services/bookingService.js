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
};
