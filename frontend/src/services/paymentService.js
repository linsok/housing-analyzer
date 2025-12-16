import api from './api';

export const paymentService = {
  async getPayments() {
    const response = await api.get('/payments/');
    return response.data;
  },

  async createPayment(data) {
    const response = await api.post('/payments/', data);
    return response.data;
  },

  async generateQR(paymentId) {
    const response = await api.post(`/payments/${paymentId}/generate_qr/`);
    return response.data;
  },

  async confirmPayment(paymentId, notes = '') {
    const response = await api.post(`/payments/${paymentId}/confirm/`, { notes });
    return response.data;
  },

  async uploadProof(paymentId, file) {
    const formData = new FormData();
    formData.append('payment_proof', file);

    const response = await api.post(`/payments/${paymentId}/upload_proof/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
