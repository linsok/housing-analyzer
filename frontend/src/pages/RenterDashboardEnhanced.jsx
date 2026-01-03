import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Heart, DollarSign, TrendingUp, Home, Clock, 
  AlertCircle, MapPin, Eye, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { analyticsService } from '../services/analyticsService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart 
} from 'recharts';

const RenterDashboardEnhanced = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly'); // 'monthly' or 'yearly'

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsService.getRenterAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'success',
      completed: 'info',
      cancelled: 'error',
      rejected: 'error',
    };
    const statusText = status === 'completed' ? 'completed check' : status;
    return <Badge variant={variants[status] || 'default'}>{statusText}</Badge>;
  };

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) return <Loading />;
  if (!analytics) return <div>No data available</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Renter Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your rentals, spending, and payment schedules</p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex space-x-4 mb-8">
          <Link to="/renter/room-bookings">
            <Button variant="outline" className="flex items-center">
              <Home className="w-5 h-5 mr-2" />
              My Room Bookings
            </Button>
          </Link>
          <Link to="/renter/visit-bookings">
            <Button variant="outline" className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              My Visit Bookings
            </Button>
          </Link>
          <Link to="/renter/analysis">
            <Button variant="outline" className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Analysis
            </Button>
          </Link>
        </div>

        {/* Payment Reminders - Urgent Section */}
        {analytics.payment_reminders && analytics.payment_reminders.length > 0 && (
          <div className="mb-8">
            {analytics.payment_reminders.map((reminder) => (
              <Card 
                key={reminder.booking_id}
                className={`${
                  reminder.is_urgent 
                    ? 'bg-red-50 border-red-300' 
                    : 'bg-yellow-50 border-yellow-300'
                } mb-4`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${
                    reminder.is_urgent ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    <AlertCircle className={`w-6 h-6 ${
                      reminder.is_urgent ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${
                        reminder.is_urgent ? 'text-red-900' : 'text-yellow-900'
                      }`}>
                        {reminder.is_urgent ? '🚨 Urgent Payment Due!' : '⏰ Upcoming Payment'}
                      </h3>
                      <Badge variant={reminder.is_urgent ? 'error' : 'warning'}>
                        {reminder.days_until_payment} {reminder.days_until_payment === 1 ? 'day' : 'days'} left
                      </Badge>
                    </div>
                    <div className="text-sm mb-2">
                      <div className="font-medium text-gray-900">{reminder.property_title}</div>
                      <div className="text-gray-600">{reminder.property_address}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-600">Payment Amount: </span>
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(reminder.monthly_rent)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Due: {formatDate(reminder.next_payment_date)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <Calendar className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{analytics.overview.total_bookings}</div>
            <div className="text-gray-600 text-sm">Total Bookings</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.overview.confirmed_bookings} confirmed
            </div>
          </Card>

          <Card className="text-center">
            <Home className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{analytics.overview.active_rentals}</div>
            <div className="text-gray-600 text-sm">Active Rentals</div>
            <div className="text-xs text-gray-500 mt-1">
              Currently renting
            </div>
          </Card>

          <Card className="text-center">
            <DollarSign className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{formatCurrency(analytics.overview.total_spent)}</div>
            <div className="text-gray-600 text-sm">Total Spent</div>
            <div className="text-xs text-gray-500 mt-1">
              All time
            </div>
          </Card>

          <Card className="text-center">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{analytics.overview.favorites_count}</div>
            <div className="text-gray-600 text-sm">Favorites</div>
            <div className="text-xs text-gray-500 mt-1">
              <Link to="/favorites" className="text-primary-600 hover:underline">
                View all
              </Link>
            </div>
          </Card>
        </div>

        {/* Spending Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly/Yearly Spending Chart */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Spending Analytics
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
                <AreaChart data={analytics.monthly_spending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    name="Amount Spent" 
                  />
                </AreaChart>
              ) : (
                <BarChart data={analytics.yearly_spending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="amount" fill="#10b981" name="Amount Spent" />
                </BarChart>
              )}
            </ResponsiveContainer>

            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Average Rent</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(analytics.overview.avg_rent_paid)}/mo
                </div>
              </div>
              <div>
                <div className="text-gray-600">This {timeRange === 'monthly' ? 'Month' : 'Year'}</div>
                <div className="text-lg font-semibold">
                  {formatCurrency(
                    timeRange === 'monthly'
                      ? analytics.monthly_spending[analytics.monthly_spending.length - 1]?.amount || 0
                      : analytics.yearly_spending[analytics.yearly_spending.length - 1]?.amount || 0
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Spending by Property Type */}
          <Card>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Spending by Property Type
            </h2>

            {analytics.spending_by_type && analytics.spending_by_type.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.spending_by_type}
                      dataKey="total_spent"
                      nameKey="property_type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => entry.property_type}
                    >
                      {analytics.spending_by_type.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-4 pt-4 border-t space-y-2">
                  {analytics.spending_by_type.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="capitalize">{item.property_type}</span>
                      </div>
                      <div className="font-semibold">{formatCurrency(item.total_spent)}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <PieChartIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No spending data yet</p>
              </div>
            )}
          </Card>
        </div>

        {/* Rental History */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Rental History
          </h2>

          {analytics.rental_history && analytics.rental_history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Rent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.rental_history.map((rental) => (
                    <tr key={rental.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {rental.property_title}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {rental.property_city}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                        {rental.property_type}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {formatCurrency(rental.monthly_rent)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(rental.start_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {rental.end_date ? formatDate(rental.end_date) : 'Ongoing'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getStatusBadge(rental.status)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Link to={`/properties/${rental.property_id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No rental history yet</p>
              <Link to="/properties">
                <Button className="mt-4">
                  <Home className="w-4 h-4 mr-2" />
                  Browse Properties
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/properties">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center py-4">
                <Home className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Browse Properties</h3>
                <p className="text-sm text-gray-600">Find your next rental</p>
              </div>
            </Card>
          </Link>

          <Link to="/favorites">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center py-4">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">My Favorites</h3>
                <p className="text-sm text-gray-600">{analytics.overview.favorites_count} saved properties</p>
              </div>
            </Card>
          </Link>

          <Link to="/market-trend">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center py-4">
                <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Market Trends</h3>
                <p className="text-sm text-gray-600">Explore rental market</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RenterDashboardEnhanced;
