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

  async cancelBooking(id, data = {}) {
    const response = await api.post(`/bookings/${id}/cancel/`, data);
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
    const response = await api.get('/bookings/', { params });
    return response.data;
  },

  async getViewingRequests(propertyId) {
    const response = await api.get('/bookings/viewing_requests/', {
      params: { property_id: propertyId }
    });
    return response.data;
  },

  async updateViewingStatus(id, status) {
    const response = await api.patch(`/bookings/${id}/`, { status });
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
    const response = await api.get('/bookings/availability/', {
      params: { property_id: propertyId, date }
    });
    return response.data;
  },

  // Payment with transaction upload
  async submitPaymentWithTransaction(formData) {
    try {
      console.log('=== BOOKING SERVICE DEBUG ===');
      console.log('Submitting payment to /bookings/payment_with_transaction/');
      
      const response = await api.post('/bookings/payment_with_transaction/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Payment submission successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('=== BOOKING SERVICE ERROR ===');
      console.error('Payment submission failed:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      // Re-throw with enhanced error information
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while processing payment');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid payment data provided');
      } else if (error.response?.status === 404) {
        throw new Error('Payment endpoint not found');
      } else {
        throw error;
      }
    }
  },

  // Review and verify transaction
  async reviewTransaction(bookingId, action, notes = '') {
    const response = await api.post(`/bookings/${bookingId}/review-transaction/`, {
      action, // 'approve' or 'reject'
      notes
    });
    return response.data;
  },

  // Get booking with transaction details
  async getBookingWithTransaction(bookingId) {
    const response = await api.get(`/bookings/${bookingId}/with-transaction/`);
    return response.data;
  }
};
