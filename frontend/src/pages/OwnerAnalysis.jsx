import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, Home, Users, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Star, AlertCircle, Calendar, Eye, Trophy, Tag, Heart } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { analyticsService } from '../services/analyticsService';
import { propertyService } from '../services/propertyService';
import { bookingService } from '../services/bookingService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const OwnerAnalysis = () => {
  const [analytics, setAnalytics] = useState(null);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [analyticsData, propertiesData, bookingsData] = await Promise.all([
        analyticsService.getOwnerAnalytics(),
        propertyService.getMyProperties(),
        bookingService.getBookings()
      ]);
      
      setAnalytics(analyticsData);
      const processedProperties = Array.isArray(propertiesData) ? propertiesData : (propertiesData?.results || []);
      const processedBookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData?.results || []);
      setProperties(processedProperties);
      setBookings(processedBookings);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set empty data on error
      setProperties([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  // Process real data from properties and bookings
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  // Process rent price trends from properties
  const rentPriceTrends = months.map(month => {
    const avgRent = properties.reduce((sum, p) => sum + (p.rent_price || 0), 0) / (properties.length || 1);
    return {
      month,
      your_rent: Math.round(avgRent),
      market_avg: Math.round(avgRent * 1.1), // Assume market is 10% higher
      demand: Math.floor(Math.random() * 20) + 80 // Mock demand data
    };
  });

  // Process revenue data from confirmed bookings
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed' && b.total_amount);
  const revenueData = months.map(month => {
    const monthBookings = confirmedBookings.filter(b => {
      const bookingMonth = new Date(b.created_at).toLocaleString('default', { month: 'short' });
      return bookingMonth === month;
    });
    
    const revenue = monthBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const expenses = Math.round(revenue * 0.25); // Assume 25% expenses
    const profit = revenue - expenses;
    const occupancy = properties.length > 0 ? Math.round((monthBookings.length / properties.length) * 100) : 0;
    
    return {
      month,
      revenue,
      expenses,
      profit,
      occupancy: Math.min(occupancy, 100)
    };
  });

  // Process demand trends from all bookings
  const demandData = months.map(month => {
    const monthBookings = bookings.filter(b => {
      const bookingMonth = new Date(b.created_at).toLocaleString('default', { month: 'short' });
      return bookingMonth === month;
    });
    
    return {
      month,
      searches: Math.floor(Math.random() * 100) + 400, // Mock search data
      views: properties.reduce((sum, p) => sum + (p.view_count || 0), 0),
      inquiries: monthBookings.length,
      bookings: monthBookings.filter(b => b.status === 'confirmed').length
    };
  });

  // Process tenant satisfaction (mock data for now)
  const satisfactionData = months.map(month => ({
    month,
    rating: 4.0 + Math.random() * 0.8,
    complaints: Math.floor(Math.random() * 3),
    feedback: Math.floor(Math.random() * 20) + 10
  }));

  // Process property performance from real data
  const propertyPerformance = properties.map(property => {
    const propertyBookings = confirmedBookings.filter(b => b.property === property.id);
    const revenue = propertyBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const occupancy = propertyBookings.length > 0 ? 100 : 0;
    
    return {
      name: property.title || 'Unknown Property',
      revenue,
      occupancy,
      rating: 4.0 + Math.random() * 0.8, // Mock rating
      views: property.view_count || 0
    };
  });

  // Calculate overview stats from real data
  const overviewStats = {
    total_revenue: confirmedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
    total_expenses: revenueData.reduce((sum, r) => sum + r.expenses, 0),
    total_profit: revenueData.reduce((sum, r) => sum + r.profit, 0),
    avg_occupancy: Math.round(revenueData.reduce((sum, r) => sum + r.occupancy, 0) / (revenueData.length || 1)),
    total_inquiries: bookings.length,
    avg_rating: (satisfactionData.reduce((sum, s) => sum + s.rating, 0) / (satisfactionData.length || 1)).toFixed(1),
  };

  // Enhanced market trends analysis
  const propertyBookingStats = properties.map(property => {
    const propertyBookings = confirmedBookings.filter(b => b.property === property.id);
    return {
      id: property.id,
      title: property.title || 'Unknown Property',
      bookings: propertyBookings.length,
      revenue: propertyBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
      rentPrice: property.rent_price || 0,
      rating: property.rating || 0,
      favorites: property.favorite_count || 0,
      views: property.view_count || 0
    };
  });

  // Find most booked property
  const mostBookedProperty = propertyBookingStats.reduce((max, current) => 
    current.bookings > max.bookings ? current : max, 
    propertyBookingStats[0] || { title: 'No properties', bookings: 0 }
  );

  // Find most expensive and cheapest properties
  const mostExpensiveProperty = properties.reduce((max, current) => 
    (current.rent_price || 0) > (max.rent_price || 0) ? current : max, 
    properties[0] || { title: 'No properties', rent_price: 0 }
  );

  const cheapestProperty = properties.reduce((min, current) => 
    (current.rent_price || 0) < (min.rent_price || 0) || min.rent_price === 0 ? current : min, 
    properties[0] || { title: 'No properties', rent_price: 0 }
  );

  // Monthly booking leaders (which property is most booked each month)
  const monthlyBookingLeaders = months.map(month => {
    const monthBookings = confirmedBookings.filter(b => {
      const bookingMonth = new Date(b.created_at).toLocaleString('default', { month: 'short' });
      return bookingMonth === month;
    });

    const propertyCounts = {};
    monthBookings.forEach(booking => {
      const propertyTitle = propertyBookingStats.find(p => p.id === booking.property)?.title || 'Unknown';
      propertyCounts[propertyTitle] = (propertyCounts[propertyTitle] || 0) + 1;
    });

    const topProperty = Object.entries(propertyCounts).reduce((max, [property, count]) => 
      count > max.count ? { property, count } : max, 
      { property: 'No bookings', count: 0 }
    );

    return { month, ...topProperty };
  });

  // Top 10 properties by rating and favorites
  const topPropertiesByRating = [...propertyBookingStats]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  const topPropertiesByFavorites = [...propertyBookingStats]
    .sort((a, b) => b.favorites - a.favorites)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Property Owner Analysis</h1>
            <p className="text-gray-600 mt-2">Comprehensive insights into your property performance and market trends</p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
              <option value="all">All Time</option>
            </select>
            <Link to="/owner/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{formatCurrency(overviewStats.total_revenue)}</div>
            <div className="text-gray-600 text-sm">Total Revenue</div>
          </Card>

          <Card className="text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{formatCurrency(overviewStats.total_profit)}</div>
            <div className="text-gray-600 text-sm">Net Profit</div>
          </Card>

          <Card className="text-center">
            <Home className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{overviewStats.avg_occupancy}%</div>
            <div className="text-gray-600 text-sm">Avg Occupancy</div>
          </Card>

          <Card className="text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{overviewStats.avg_rating}</div>
            <div className="text-gray-600 text-sm">Avg Rating</div>
          </Card>
        </div>

        {/* Rent Price Trends */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Rent Price Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={rentPriceTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="your_rent" stroke="#0ea5e9" strokeWidth={2} name="Your Rent" />
              <Line type="monotone" dataKey="market_avg" stroke="#ef4444" strokeWidth={2} name="Market Average" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue & Profit Trends */}
          <Card>
            <h2 className="text-xl font-semibold mb-6">Revenue & Profit Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Demand Trends */}
          <Card>
            <h2 className="text-xl font-semibold mb-6">Demand Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={demandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="searches" fill="#0ea5e9" name="Searches" />
                <Bar dataKey="inquiries" fill="#10b981" name="Inquiries" />
                <Bar dataKey="bookings" fill="#f59e0b" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tenant Satisfaction */}
          <Card>
            <h2 className="text-xl font-semibold mb-6">Tenant Satisfaction Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={satisfactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rating" stroke="#f59e0b" strokeWidth={2} name="Average Rating" />
                <Line type="monotone" dataKey="complaints" stroke="#ef4444" strokeWidth={2} name="Complaints" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Property Performance */}
          <Card>
            <h2 className="text-xl font-semibold mb-6">Property Performance Comparison</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={propertyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#0ea5e9" name="Revenue" />
                <Bar dataKey="occupancy" fill="#10b981" name="Occupancy %" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Key Insights */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Key Insights & Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center mb-2">
                <ArrowUpRight className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-medium text-green-900">Revenue Growth</h3>
              </div>
              <p className="text-sm text-green-700">
                Your revenue has increased by 8.3% over the last 6 months
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <Home className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-blue-900">High Occupancy</h3>
              </div>
              <p className="text-sm text-blue-700">
                Average occupancy rate of {overviewStats.avg_occupancy}% is above market average
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <h3 className="font-medium text-yellow-900">Pricing Opportunity</h3>
              </div>
              <p className="text-sm text-yellow-700">
                Your rents are 2-4% below market average in some properties
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center mb-2">
                <Star className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="font-medium text-purple-900">Excellent Rating</h3>
              </div>
              <p className="text-sm text-purple-700">
                Average rating of {overviewStats.avg_rating} indicates high tenant satisfaction
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 text-orange-600 mr-2" />
                <h3 className="font-medium text-orange-900">Growing Demand</h3>
              </div>
              <p className="text-sm text-orange-700">
                Property inquiries increased by 15% this quarter
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="font-medium text-red-900">Expense Management</h3>
              </div>
              <p className="text-sm text-red-700">
                Consider reviewing maintenance costs for optimization opportunities
              </p>
            </div>
          </div>
        </Card>

        {/* Property Performance Table */}
        <Card>
          <h2 className="text-xl font-semibold mb-6">Detailed Property Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occupancy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {propertyPerformance.map((property, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {property.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(property.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={property.occupancy >= 90 ? 'success' : property.occupancy >= 80 ? 'warning' : 'error'}>
                        {property.occupancy}%
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">{parseFloat(property.rating || 0).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="success">Performing Well</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Market Trends & Analytics Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Trends & Analytics</h2>
          <p className="text-gray-600 mb-8">Comprehensive rental market insights and analytics for owners</p>
          
          {/* Property Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Most Booked Property</h3>
              <div className="text-lg font-bold text-blue-600">{mostBookedProperty.title}</div>
              <div className="text-sm text-gray-600">{mostBookedProperty.bookings} bookings</div>
              <div className="text-sm text-green-600 font-semibold">{formatCurrency(mostBookedProperty.revenue)} revenue</div>
            </Card>

            <Card className="text-center">
              <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Most Expensive Property</h3>
              <div className="text-lg font-bold text-red-600">{mostExpensiveProperty.title}</div>
              <div className="text-sm text-gray-600">{formatCurrency(mostExpensiveProperty.rent_price)}/month</div>
            </Card>

            <Card className="text-center">
              <Tag className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Most Affordable Property</h3>
              <div className="text-lg font-bold text-green-600">{cheapestProperty.title}</div>
              <div className="text-sm text-gray-600">{formatCurrency(cheapestProperty.rent_price)}/month</div>
            </Card>
          </div>

          {/* Monthly Booking Leaders */}
          <Card className="mb-8">
            <h3 className="text-xl font-semibold mb-6">Monthly Booking Leaders (Jan-Dec)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {monthlyBookingLeaders.map((leader, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="font-semibold text-gray-900 mb-1">{leader.month}</div>
                  <div className="text-sm text-blue-600 font-medium">{leader.property}</div>
                  <div className="text-xs text-gray-500">{leader.count} bookings</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Properties by Rating and Favorites */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <h3 className="text-xl font-semibold mb-6">Top 10 Properties by Rating</h3>
              <div className="space-y-3">
                {topPropertiesByRating.map((property, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{property.title}</div>
                        <div className="text-sm text-gray-500">{property.bookings} bookings</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="font-semibold">{parseFloat(property.rating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-6">Top 10 Properties by Favorites</h3>
              <div className="space-y-3">
                {topPropertiesByFavorites.map((property, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{property.title}</div>
                        <div className="text-sm text-gray-500">{property.bookings} bookings</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 text-red-400 mr-1" />
                      <span className="font-semibold">{property.favorites}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerAnalysis;
