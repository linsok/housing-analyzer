import api from './api';

export const analyticsService = {
  async getRentTrends(params = {}) {
    const response = await api.get('/analytics/rent-trends/', { params });
    return response.data;
  },

  async getCityComparison(cities, propertyType = null) {
    const response = await api.get('/analytics/city-comparison/', {
      params: { cities, property_type: propertyType },
    });
    return response.data;
  },

  async getPopularAreas(city = null) {
    const response = await api.get('/analytics/popular-areas/', {
      params: { city },
    });
    return response.data;
  },

  async getPropertyDemand() {
    const response = await api.get('/analytics/property-demand/');
    return response.data;
  },

  async getOwnerAnalytics() {
    const response = await api.get('/analytics/owner-analytics/');
    return response.data;
  },

  async getRenterAnalytics() {
    const response = await api.get('/analytics/renter-analytics/');
    return response.data;
  },

  async getAdminDashboard() {
    const response = await api.get('/analytics/admin-dashboard/');
    return response.data;
  },

  async getMarketTrends() {
    const response = await api.get('/analytics/market-trends/');
    return response.data;
  },

  async getRenterSpending(period = '6months') {
    const response = await api.get('/analytics/renter-spending/', {
      params: { period },
    });
    return response.data;
  },

  async getRenterActivity(period = '6months') {
    const response = await api.get('/analytics/renter-activity/', {
      params: { period },
    });
    return response.data;
  },

  async getOwnerRevenueTrends(period = '6months') {
    const response = await api.get('/analytics/owner-revenue-trends/', {
      params: { period },
    });
    return response.data;
  },

  async getOwnerDemandTrends(period = '6months') {
    const response = await api.get('/analytics/owner-demand-trends/', {
      params: { period },
    });
    return response.data;
  },

  async getOwnerSatisfactionTrends(period = '6months') {
    const response = await api.get('/analytics/owner-satisfaction-trends/', {
      params: { period },
    });
    return response.data;
  },

  async getOwnerRentPriceTrends(period = '6months') {
    const response = await api.get('/analytics/owner-rent-trends/', {
      params: { period },
    });
    return response.data;
  },
};
