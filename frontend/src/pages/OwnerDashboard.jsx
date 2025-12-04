import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Home, Eye, Heart, DollarSign, TrendingUp, Calendar, List } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { propertyService } from '../services/propertyService';
import { bookingService } from '../services/bookingService';
import { analyticsService } from '../services/analyticsService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OwnerDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [propertiesData, bookingsData, analyticsData] = await Promise.all([
        propertyService.getMyProperties(),
        bookingService.getBookings(),
        analyticsService.getOwnerAnalytics(),
      ]);
      
      setProperties(propertiesData.results || propertiesData);
      setBookings(bookingsData.results || bookingsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      await bookingService.confirmBooking(bookingId);
      loadDashboardData();
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      available: 'success',
      rented: 'info',
      pending: 'warning',
      maintenance: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getVerificationBadge = (status) => {
    const variants = {
      verified: 'success',
      pending: 'warning',
      rejected: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
          <div className="flex space-x-4">
            <Link to="/owner/properties">
              <Button variant="outline" className="flex items-center">
                <List className="w-5 h-5 mr-2" />
                Manage Properties
              </Button>
            </Link>
            <Link to="/owner/properties/new">
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Add Property
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center">
              <Home className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analytics.overview.total_properties}</div>
              <div className="text-gray-600 text-sm">Total Properties</div>
            </Card>

            <Card className="text-center">
              <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analytics.overview.total_views}</div>
              <div className="text-gray-600 text-sm">Total Views</div>
            </Card>

            <Card className="text-center">
              <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analytics.overview.confirmed_bookings}</div>
              <div className="text-gray-600 text-sm">Confirmed Bookings</div>
            </Card>

            <Card className="text-center">
              <DollarSign className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{formatCurrency(analytics.overview.total_revenue)}</div>
              <div className="text-gray-600 text-sm">Total Revenue</div>
            </Card>
          </div>
        )}

        {/* Analytics Quick Link */}
        {analytics && (
          <Card className="mb-8 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Detailed Analytics Available</h2>
                <p className="text-gray-600 text-sm mb-4">
                  View comprehensive insights about your properties, guest trends, market comparisons, and competitor analysis
                </p>
                <Link to="/owner/analytics">
                  <Button>
                    <TrendingUp className="w-5 h-5 mr-2" />
                    View Full Analytics
                  </Button>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-600">{analytics.overview.occupancy_rate}%</div>
                  <div className="text-sm text-gray-600">Occupancy Rate</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Properties */}
            <Card>
              <h2 className="text-xl font-semibold mb-6">My Properties</h2>

              {properties.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No properties listed yet</p>
                  <Link to="/owner/properties/new">
                    <Button className="mt-4">
                      <Plus className="w-5 h-5 mr-2" />
                      Add Your First Property
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex gap-4">
                        {property.primary_image && (
                          <img
                            src={property.primary_image}
                            alt={property.title}
                            className="w-24 h-24 rounded object-cover"
                          />
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{property.title}</h3>
                              <p className="text-sm text-gray-600">{property.city}</p>
                            </div>
                            <div className="flex gap-2">
                              {getStatusBadge(property.status)}
                              {getVerificationBadge(property.verification_status)}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <Eye className="w-4 h-4 inline mr-1" />
                              {property.view_count} views
                            </div>
                            <div>
                              <Heart className="w-4 h-4 inline mr-1" />
                              {property.favorite_count} favorites
                            </div>
                            <div className="font-semibold text-primary-600">
                              {formatCurrency(property.rent_price)}/mo
                            </div>
                          </div>

                          
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Performance Chart */}
            {analytics && analytics.property_performance.length > 0 && (
              <Card>
                <h2 className="text-xl font-semibold mb-6">Property Performance</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.property_performance.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#0ea5e9" name="Views" />
                    <Bar dataKey="bookings" fill="#10b981" name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Bookings */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Pending Bookings</h2>
              
              {bookings.filter(b => b.status === 'pending').length === 0 ? (
                <p className="text-gray-600 text-sm">No pending bookings</p>
              ) : (
                <div className="space-y-3">
                  {bookings
                    .filter(b => b.status === 'pending')
                    .slice(0, 3)
                    .map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="text-sm font-medium mb-1">
                          {booking.renter_details?.full_name}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {booking.property_details?.title}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {formatDate(booking.start_date || booking.visit_time)}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleConfirmBooking(booking.id)}
                            className="flex-1"
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Card>

            {/* Pricing Comparison */}
            {analytics && (
              <Card>
                <h2 className="text-xl font-semibold mb-4">Pricing Insights</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Your Avg. Rent</span>
                    <span className="font-semibold">
                      {formatCurrency(analytics.pricing_comparison.your_avg_rent)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">City Avg. Rent</span>
                    <span className="font-semibold">
                      {formatCurrency(analytics.pricing_comparison.city_avg_rent)}
                    </span>
                  </div>
                  <div className="pt-3 border-t">
                    {analytics.pricing_comparison.your_avg_rent > analytics.pricing_comparison.city_avg_rent ? (
                      <p className="text-sm text-yellow-600">
                        Your prices are above market average
                      </p>
                    ) : (
                      <p className="text-sm text-green-600">
                        Your prices are competitive
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link to="/owner/properties/new">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Property
                  </Button>
                </Link>
                <Link to="/owner/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                </Link>
                <Link to="/market-trend">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Market Trends
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
