import { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Eye, DollarSign, Home, Calendar, 
  BarChart3, PieChart, Activity, Target, Award, AlertCircle 
} from 'lucide-react';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import { analyticsService } from '../services/analyticsService';
import { formatCurrency } from '../utils/formatters';
import { 
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart 
} from 'recharts';

const OwnerAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly'); // 'monthly' or 'yearly'

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsService.getOwnerAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!analytics) return <div>No data available</div>;

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary-600" />
            Property Analytics & Insights
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive analytics to help you understand your property performance and market position
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <Home className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{analytics.overview.total_properties}</div>
            <div className="text-gray-600 text-sm">Total Properties</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.overview.verified_properties} verified
            </div>
          </Card>

          <Card className="text-center">
            <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{analytics.overview.total_views}</div>
            <div className="text-gray-600 text-sm">Total Views</div>
            <div className="text-xs text-gray-500 mt-1">All time</div>
          </Card>

          <Card className="text-center">
            <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{analytics.overview.confirmed_bookings}</div>
            <div className="text-gray-600 text-sm">Confirmed Guests</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.overview.pending_bookings} pending
            </div>
          </Card>

          <Card className="text-center">
            <DollarSign className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{formatCurrency(analytics.overview.total_revenue)}</div>
            <div className="text-gray-600 text-sm">Total Revenue</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.overview.occupancy_rate}% occupancy
            </div>
          </Card>
        </div>

        {/* Guest Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly/Yearly Toggle and Chart */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Guest Analytics
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeRange('monthly')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    timeRange === 'monthly'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setTimeRange('yearly')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    timeRange === 'yearly'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              {timeRange === 'monthly' ? (
                <AreaChart data={analytics.monthly_guests}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="guests" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    name="Confirmed Guests" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pending" 
                    stackId="1"
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    name="Pending" 
                  />
                </AreaChart>
              ) : (
                <BarChart data={analytics.yearly_guests}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="guests" fill="#10b981" name="Total Guests" />
                </BarChart>
              )}
            </ResponsiveContainer>

            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">This {timeRange === 'monthly' ? 'Month' : 'Year'}</div>
                <div className="text-lg font-semibold">
                  {timeRange === 'monthly' 
                    ? analytics.monthly_guests[analytics.monthly_guests.length - 1]?.guests || 0
                    : analytics.yearly_guests[analytics.yearly_guests.length - 1]?.guests || 0
                  } guests
                </div>
              </div>
              <div>
                <div className="text-gray-600">Revenue</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(
                    timeRange === 'monthly'
                      ? analytics.monthly_guests[analytics.monthly_guests.length - 1]?.revenue || 0
                      : analytics.yearly_guests[analytics.yearly_guests.length - 1]?.revenue || 0
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Views Trend */}
          <Card>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Views Trend (Last 30 Days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.views_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Daily Views"
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">Average Daily Views</div>
              <div className="text-lg font-semibold">
                {(analytics.views_trend.reduce((sum, day) => sum + day.views, 0) / analytics.views_trend.length).toFixed(1)}
              </div>
            </div>
          </Card>
        </div>

        {/* Property Performance */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Property Performance Comparison
          </h2>
          
          {analytics.property_performance.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analytics.property_performance.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" angle={-15} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="views" fill="#0ea5e9" name="Views" />
                  <Bar yAxisId="left" dataKey="bookings" fill="#10b981" name="Bookings" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#f59e0b" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.property_performance.map((prop) => (
                      <tr key={prop.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{prop.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(prop.rent_price)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{prop.views}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{prop.bookings}</td>
                        <td className="px-4 py-3 text-sm text-green-600 font-medium">{formatCurrency(prop.revenue)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-yellow-500" />
                            {prop.rating.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No properties to analyze yet</p>
            </div>
          )}
        </Card>

        {/* Market Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pricing Comparison */}
          <Card>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Market Pricing Comparison
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Your Average Price</span>
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(analytics.pricing_comparison.your_avg_rent)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Market Average Price</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(analytics.pricing_comparison.city_avg_rent)}
                </span>
              </div>
            </div>

            {analytics.pricing_comparison.by_type && analytics.pricing_comparison.by_type.length > 0 && (
              <>
                <h3 className="font-semibold mb-3 text-sm text-gray-700">By Property Type</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.pricing_comparison.by_type}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="property_type" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="your_avg" fill="#0ea5e9" name="Your Avg" />
                    <Bar dataKey="market_avg" fill="#94a3b8" name="Market Avg" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}

            <div className="mt-4 pt-4 border-t">
              {analytics.pricing_comparison.your_avg_rent > analytics.pricing_comparison.city_avg_rent ? (
                <div className="flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Above Market Average</div>
                    <div className="text-xs mt-1">
                      Your prices are {(((analytics.pricing_comparison.your_avg_rent - analytics.pricing_comparison.city_avg_rent) / analytics.pricing_comparison.city_avg_rent) * 100).toFixed(1)}% higher than market average. 
                      Consider adjusting to attract more renters.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 p-3 rounded">
                  <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Competitive Pricing</div>
                    <div className="text-xs mt-1">
                      Your prices are competitive with the market. Great positioning!
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Competitor Analysis */}
          <Card>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Top Competing Properties
            </h2>

            {analytics.competitor_analysis && analytics.competitor_analysis.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  Most popular properties in your area. Learn from their success!
                </p>
                
                <div className="overflow-y-auto max-h-96">
                  {analytics.competitor_analysis.map((comp, index) => (
                    <div 
                      key={index} 
                      className="p-3 border border-gray-200 rounded-lg mb-3 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">{comp.title}</div>
                          <div className="text-xs text-gray-500 capitalize">{comp.property_type} • {comp.bedrooms} bed</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-primary-600">
                            {formatCurrency(comp.rent_price)}/mo
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye className="w-3 h-3" />
                          {comp.views}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="w-3 h-3" />
                          {comp.favorites}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Award className="w-3 h-3 text-yellow-500" />
                          {comp.rating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    <strong>Insights:</strong> Analyze what makes these properties popular - pricing, amenities, photos, and descriptions.
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No competitor data available</p>
              </div>
            )}
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Recommendations to Improve Performance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Optimize Pricing
              </h3>
              <p className="text-sm text-gray-600">
                {analytics.pricing_comparison.your_avg_rent > analytics.pricing_comparison.city_avg_rent
                  ? 'Consider lowering prices to match market average and increase bookings.'
                  : 'Your pricing is competitive. Consider premium amenities to justify higher rates.'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                Increase Visibility
              </h3>
              <p className="text-sm text-gray-600">
                Add high-quality photos, detailed descriptions, and respond quickly to inquiries to boost views.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Enhance Guest Experience
              </h3>
              <p className="text-sm text-gray-600">
                Maintain high ratings by providing excellent service and amenities. Good reviews attract more guests.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Home className="w-4 h-4 text-orange-600" />
                Property Updates
              </h3>
              <p className="text-sm text-gray-600">
                Regular maintenance and modern amenities can justify higher prices and attract quality tenants.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OwnerAnalytics;
