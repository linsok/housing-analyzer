import api from './api';

export const customerService = {
  async getActiveCustomers() {
    console.log('Fetching active customers...');
    const response = await api.get('/bookings/', {
      params: {
        booking_type: 'rental',
        // Show both confirmed and completed customers in active list
        status__in: 'confirmed,completed',
        // Exclude customers who have actually checked out
        checked_out_at__isnull: 'true',
        // Add timestamp to prevent caching
        _t: Date.now()
      }
    });
    console.log('Active customers response:', response.data);
    return response.data;
  },

  async getCustomerHistory() {
    console.log('Fetching customer history...');
    try {
      const response = await api.get('/bookings/', {
        params: { 
          booking_type: 'rental',
          // Filter for customers who have actually checked out (not just marked complete)
          checked_out_at__isnull: false,
          // Add timestamp to prevent caching
          _t: Date.now()
        }
      });
      console.log('Customer history response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer history:', error);
      throw error;
    }
  },

  async checkOutCustomer(bookingId) {
    const response = await api.post(`/bookings/${bookingId}/checkout/`);
    return response.data;
  },

  async deleteCustomerHistory(bookingId) {
    try {
      console.log(`Attempting to hide booking ${bookingId} from owner view`);
      const response = await api.post(`/bookings/${bookingId}/hide_from_owner/`);
      console.log('Hide response:', response);
      console.log('Hide response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Hide error details:', error.response?.data || error.message);
      console.error('Full error object:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error status text:', error.response?.statusText);
      throw error;
    }
  },

  // Transform booking data to customer format
  transformBookingToCustomer(booking) {
    return {
      id: booking.id,
      renter_name: booking.renter_details?.full_name || booking.renter_details?.username || 'Unknown',
      email: booking.renter_details?.email || 'N/A',
      phone_number: booking.contact_phone || booking.renter_details?.phone_number || 'N/A',
      move_in_date: booking.start_date || booking.confirmed_at,
      property_name: booking.property_details?.title || 'Unknown Property',
      // Get monthly payment from multiple sources with fallback
      monthly_payment: parseFloat(
        booking.monthly_rent || 
        booking.property_details?.rent_price || 
        booking.property_details?.monthly_rent || 
        0
      ),
      status: booking.status === 'confirmed' ? 'still living' : 
               booking.status === 'completed' ? 'still living' : booking.status,
      check_out_date: booking.completed_at || booking.updated_at || booking.end_date,
      booking_id: booking.id
    };
  }
};
