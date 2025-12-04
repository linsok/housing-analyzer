import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, MapPin, DollarSign, Home, Building2, Users, Eye, Star, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';
import Card from '../components/ui/Card';
import { analyticsService } from '../services/analyticsService';
import { useAuthStore } from '../store/useAuthStore';
import Loading from '../components/ui/Loading';

const MarketTrend = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getMarketTrends();
      setMarketData(data);
      setError(null);
    } catch (error) {
      console.error('Error loading market data:', error);
      setError('Failed to load market trends. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !marketData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{error || 'No data available'}</p>
          <button 
            onClick={loadMarketData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  const { market_overview, price_by_city, price_by_type, price_trends, bedroom_distribution, 
          furnished_stats, price_distribution, top_areas, role_specific, user_role } = marketData;

  // Format data for charts
  const formattedPriceByCity = price_by_city.map(item => ({
    city: item.city,
    avgPrice: Math.round(item.avg_price),
    minPrice: Math.round(item.min_price),
    maxPrice: Math.round(item.max_price),
    count: item.count
  }));

  const formattedPriceByType = price_by_type.map(item => ({
    type: item.property_type.charAt(0).toUpperCase() + item.property_type.slice(1),
    avgPrice: Math.round(item.avg_price),
    count: item.count
  }));

  const formattedPriceTrends = price_trends.map(item => ({
    month: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    avgPrice: Math.round(item.avg_price),
    minPrice: Math.round(item.min_price),
    maxPrice: Math.round(item.max_price),
    count: item.count
  }));

  const formattedBedroomDist = bedroom_distribution.map(item => ({
    bedrooms: `${item.bedrooms || 0} BR`,
    count: item.count,
    avgPrice: Math.round(item.avg_price)
  }));

  const furnishedData = [
    { name: 'Furnished', count: furnished_stats.furnished.count, avgPrice: Math.round(furnished_stats.furnished.avg_price || 0) },
    { name: 'Unfurnished', count: furnished_stats.unfurnished.count, avgPrice: Math.round(furnished_stats.unfurnished.avg_price || 0) }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Market Trends & Analytics
            </h1>
            <p className="text-xl text-primary-100">
              Comprehensive rental market insights and analytics for {user_role === 'guest' ? 'everyone' : user_role + 's'}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Market Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center p-6">
            <DollarSign className="w-10 h-10 text-primary-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900">${Math.round(market_overview.avg_rent)}</div>
            <div className="text-gray-600">Average Rent Price</div>
          </Card>

          <Card className="text-center p-6">
            <Home className="w-10 h-10 text-green-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900">{market_overview.total_properties}</div>
            <div className="text-gray-600">Total Properties</div>
          </Card>

          <Card className="text-center p-6">
            <MapPin className="w-10 h-10 text-orange-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900">{market_overview.cities_count}</div>
            <div className="text-gray-600">Cities Covered</div>
          </Card>

          <Card className="text-center p-6">
            <Activity className="w-10 h-10 text-purple-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900">{price_by_type.length}</div>
            <div className="text-gray-600">Property Types</div>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="mb-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Market Analytics</h2>
          
          {/* Price Trends Over Time */}
          {formattedPriceTrends.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Price Trends Over Time</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={formattedPriceTrends}>
                  <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => `$${value}`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="avgPrice" stroke="#3B82F6" fillOpacity={1} fill="url(#colorAvg)" name="Average Price" />
                  <Line type="monotone" dataKey="minPrice" stroke="#10B981" strokeWidth={2} name="Min Price" />
                  <Line type="monotone" dataKey="maxPrice" stroke="#EF4444" strokeWidth={2} name="Max Price" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Price by City Chart */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Average Rent Price by City (Top 10)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={formattedPriceByCity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" angle={-45} textAnchor="end" height={100} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name.includes('Price')) return `$${value}`;
                    return value;
                  }}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="avgPrice" fill="#3B82F6" name="Avg Price ($)" />
                <Line yAxisId="right" type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={2} name="Property Count" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price by Property Type */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Price by Property Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formattedPriceByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => `$${value}`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                  />
                  <Legend />
                  <Bar dataKey="avgPrice" fill="#10B981" name="Average Price ($)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Price Distribution Pie Chart */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Price Range Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={price_distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, count }) => `${range}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {price_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bedroom Distribution */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Properties by Bedroom Count</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formattedBedroomDist}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bedrooms" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
                  <Legend />
                  <Bar dataKey="count" fill="#8B5CF6" name="Property Count" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Furnished vs Unfurnished */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Furnished vs Unfurnished</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={furnishedData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, count }) => `${name}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {furnishedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        {/* Role-Specific Insights */}
        {role_specific && Object.keys(role_specific).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {user_role === 'owner' && 'Your Property Performance'}
              {user_role === 'renter' && 'Your Activity & Recommendations'}
              {user_role === 'admin' && 'Platform Overview'}
            </h2>

            {/* Owner-Specific Dashboard */}
            {user_role === 'owner' && role_specific.my_properties && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4 text-center">
                    <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{role_specific.my_properties.total}</div>
                    <div className="text-sm text-gray-600">Total Properties</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <Home className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{role_specific.my_properties.available}</div>
                    <div className="text-sm text-gray-600">Available</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{role_specific.my_properties.total_views}</div>
                    <div className="text-sm text-gray-600">Total Views</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">${Math.round(role_specific.my_properties.avg_price)}</div>
                    <div className="text-sm text-gray-600">Avg Price</div>
                  </Card>
                </div>

                {role_specific.property_performance && role_specific.property_performance.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Top Performing Properties</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-4">Property</th>
                            <th className="text-right py-2 px-4">Price</th>
                            <th className="text-right py-2 px-4">Views</th>
                            <th className="text-right py-2 px-4">Favorites</th>
                            <th className="text-right py-2 px-4">Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {role_specific.property_performance.map((prop, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="py-2 px-4">{prop.title}</td>
                              <td className="text-right py-2 px-4">${prop.rent_price}</td>
                              <td className="text-right py-2 px-4">{prop.view_count}</td>
                              <td className="text-right py-2 px-4">{prop.favorite_count}</td>
                              <td className="text-right py-2 px-4">
                                <span className="flex items-center justify-end">
                                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                  {prop.rating}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Renter-Specific Dashboard */}
            {user_role === 'renter' && role_specific.my_bookings && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 text-center">
                    <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{role_specific.my_bookings.total}</div>
                    <div className="text-sm text-gray-600">Total Bookings</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{role_specific.my_bookings.active}</div>
                    <div className="text-sm text-gray-600">Active Bookings</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{role_specific.favorites?.count || 0}</div>
                    <div className="text-sm text-gray-600">Favorites</div>
                  </Card>
                </div>

                {role_specific.recommendations && role_specific.recommendations.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Recommended Properties</h3>
                    <div className="space-y-3">
                      {role_specific.recommendations.map((prop, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                          <div>
                            <h4 className="font-semibold">{prop.title}</h4>
                            <p className="text-sm text-gray-600">{prop.city} • {prop.property_type}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary-600">${prop.rent_price}</div>
                            <div className="text-sm text-gray-600 flex items-center">
                              <Star className="w-3 h-3 text-yellow-500 mr-1" />
                              {prop.rating}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Admin-Specific Dashboard */}
            {user_role === 'admin' && role_specific.platform_stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4 text-center">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{role_specific.platform_stats.total_users}</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <Building2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{role_specific.platform_stats.total_properties}</div>
                    <div className="text-sm text-gray-600">Total Properties</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{role_specific.platform_stats.total_bookings}</div>
                    <div className="text-sm text-gray-600">Total Bookings</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">${Math.round(role_specific.revenue_estimate)}</div>
                    <div className="text-sm text-gray-600">Revenue</div>
                  </Card>
                </div>

                {role_specific.recent_activity && (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Recent Activity (Last 30 Days)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{role_specific.recent_activity.new_users_30d}</div>
                        <div className="text-sm text-gray-600">New Users</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{role_specific.recent_activity.new_properties_30d}</div>
                        <div className="text-sm text-gray-600">New Properties</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{role_specific.recent_activity.new_bookings_30d}</div>
                        <div className="text-sm text-gray-600">New Bookings</div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketTrend;
