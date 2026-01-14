import api from './api';

const bakongService = {
  /**
   * Generate Bakong KHQR code for payment
   * @param {Object} paymentData - Payment data
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.currency - Currency code (KHR or USD)
   * @param {string} paymentData.property_title - Property title
   * @param {string} paymentData.booking_id - Booking ID
   * @param {string} paymentData.renter_name - Renter name
   * @returns {Promise<Object>} KHQR data including QR image and hash
   */
  generateKHQR: async (paymentData) => {
    try {
      const response = await api.post('/payments/generate_khqr/', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error generating KHQR:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
      
      // Throw a more descriptive error
      throw {
        message: errorMessage,
        status: error.response?.status,
        error: errorMessage
      };
    }
  },

  /**
   * Check payment status using MD5 hash
   * @param {string} md5Hash - MD5 hash of the QR code
   * @returns {Promise<Object>} Payment status
   */
  checkPaymentStatus: async (md5Hash) => {
    try {
      const response = await api.post('/payments/check_payment_status/', {
        md5_hash: md5Hash
      });
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get payment details using MD5 hash
   * @param {string} md5Hash - MD5 hash of the QR code
   * @returns {Promise<Object>} Payment details
   */
  getPaymentDetails: async (md5Hash) => {
    try {
      const response = await api.post('/payments/get_payment_details/', {
        md5_hash: md5Hash
      });
      return response.data;
    } catch (error) {
      console.error('Error getting payment details:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Start payment verification polling
   * @param {string} md5Hash - MD5 hash to monitor
   * @param {Function} onStatusChange - Callback for status changes
   * @param {number} interval - Polling interval in milliseconds (default: 5000)
   * @returns {Object} Polling control object
   */
  startPaymentVerification: (md5Hash, onStatusChange, interval = 5000) => {
    let pollCount = 0;
    const maxPolls = 60; // Maximum 5 minutes of polling
    
    const poll = async () => {
      try {
        pollCount++;
        
        if (pollCount > maxPolls) {
          onStatusChange({ status: 'timeout', message: 'Payment verification timed out' });
          return;
        }

        const status = await bakongService.checkPaymentStatus(md5Hash);
        onStatusChange(status);

        // Stop polling if payment is successful
        if (status.status === 'PAID') {
          return;
        }

        // Continue polling
        setTimeout(poll, interval);
        
      } catch (error) {
        console.error('Payment verification error:', error);
        onStatusChange({ 
          status: 'error', 
          message: 'Failed to verify payment',
          error: error 
        });
      }
    };

    // Start polling
    setTimeout(poll, interval);

    return {
      stop: () => {
        pollCount = maxPolls + 1; // Stop polling
      }
    };
  }
};

export default bakongService;
