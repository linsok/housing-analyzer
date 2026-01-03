import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, Calendar, Home, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Eye, Target, TrendingDown } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { bookingService } from '../services/bookingService';
import { propertyService } from '../services/propertyService';
import { analyticsService } from '../services/analyticsService';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const RenterAnalysis = () => {
  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [propertyPaymentSummary, setPropertyPaymentSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [analyticsData, bookingsData] = await Promise.all([
        analyticsService.getRenterAnalytics(),
        bookingService.getBookings()
      ]);
      
      setAnalytics(analyticsData);
      const processedBookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData?.results || []);
      setBookings(processedBookings);
      
      // Process payment data from existing bookings
      processPaymentData(processedBookings);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set empty data on error
      setBookings([]);
      setPaymentData([]);
      setPropertyPaymentSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const processPaymentData = (bookingsData) => {
    // Process confirmed bookings to extract payment information
    const confirmedBookings = bookingsData.filter(b => b.status === 'confirmed' && b.total_amount);
    const monthlyData = {};
    const allProperties = new Set();
    
    confirmedBookings.forEach(booking => {
      const month = new Date(booking.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
      const propertyTitle = booking.property_details?.title || booking.property_title || 'Unknown Property';
      const amount = booking.total_amount || 0;
      
      allProperties.add(propertyTitle);
      
      if (!monthlyData[month]) {
        monthlyData[month] = {};
      }
      
      if (!monthlyData[month][propertyTitle]) {
        monthlyData[month][propertyTitle] = 0;
      }
      
      monthlyData[month][propertyTitle] += amount;
    });
    
    // Convert to arrays for state
    const paymentArray = [];
    const summaryArray = [];
    
    Object.entries(monthlyData).forEach(([month, properties]) => {
      Object.entries(properties).forEach(([property, amount]) => {
        paymentArray.push({
          month,
          property,
          amount,
          date: new Date().toLocaleDateString(),
          status: 'Paid'
        });
        
        summaryArray.push({
          month,
          property_title: property,
          total_amount: amount
        });
      });
    });
    
    setPaymentData(paymentArray);
    setPropertyPaymentSummary(summaryArray);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'success',
      completed: 'info',
      cancelled: 'error',
      rejected: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (loading) return <Loading />;

  // Process real payment data from state
  const monthlyPropertyPayments = {};
  const allProperties = new Set();
  
  // Use processed payment data
  paymentData.forEach(payment => {
    const month = payment.month;
    const propertyTitle = payment.property;
    const amount = payment.amount || 0;
    
    allProperties.add(propertyTitle);
    
    if (!monthlyPropertyPayments[month]) {
      monthlyPropertyPayments[month] = {};
    }
    
    if (!monthlyPropertyPayments[month][propertyTitle]) {
      monthlyPropertyPayments[month][propertyTitle] = 0;
    }
    
    monthlyPropertyPayments[month][propertyTitle] += amount;
  });

  // Create chart data structure
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const propertyList = Array.from(allProperties);
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  // Create data for the stacked bar chart
  const chartData = months.map(month => {
    const monthData = { month };
    propertyList.forEach(property => {
      monthData[property] = monthlyPropertyPayments[month]?.[property] || 0;
    });
    return monthData;
  });

  // Create table data from paymentData
  const tableData = [...paymentData].sort((a, b) => {
    const monthOrder = months.indexOf(a.month) - months.indexOf(b.month);
    if (monthOrder !== 0) return monthOrder;
    return b.amount - a.amount;
  });

  // Calculate booking stats from real data
  const bookingStats = {
    total_bookings: bookings.length,
    total_spending: bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
    most_booked_property: propertyList.length > 0 ? propertyList[0] : 'No properties',
    average_spending: bookings.length > 0 ? bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0) / bookings.filter(b => b.total_amount).length : 0,
    visit_bookings: bookings.filter(b => b.booking_type === 'visit').length,
    rental_bookings: bookings.filter(b => b.booking_type === 'rental').length,
  };

  // Mock rent price trends for comparison (can be replaced with real data later)
  const rentPriceTrends = [
    { month: 'Jan', your_rent: 800, similar_avg: 850, market_avg: 900, area_avg: 820 },
    { month: 'Feb', your_rent: 800, similar_avg: 860, market_avg: 920, area_avg: 830 },
    { month: 'Mar', your_rent: 750, similar_avg: 870, market_avg: 940, area_avg: 840 },
    { month: 'Apr', your_rent: 750, similar_avg: 880, market_avg: 960, area_avg: 850 },
    { month: 'May', your_rent: 700, similar_avg: 890, market_avg: 980, area_avg: 860 },
    { month: 'Jun', your_rent: 700, similar_avg: 900, market_avg: 1000, area_avg: 870 },
  ];

  // Create spending data from payment data for charts
  const spendingData = months.map(month => {
    const monthPayments = paymentData.filter(p => p.month === month);
    const totalSpending = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    const bookingCount = bookings.filter(b => {
      const bookingMonth = new Date(b.created_at).toLocaleString('default', { month: 'short' });
      return bookingMonth === month;
    }).length;
    const visitCount = bookings.filter(b => {
      const bookingMonth = new Date(b.created_at).toLocaleString('default', { month: 'short' });
      return bookingMonth === month && b.booking_type === 'visit';
    }).length;
    
    return {
      month,
      spending: totalSpending,
      bookings: bookingCount,
      visits: visitCount,
      properties: monthPayments.length
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Renter Analysis</h1>
            <p className="text-gray-600 mt-2">Track your spending, bookings, and rental activity</p>
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
            <Link to="/renter/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{formatCurrency(bookingStats.total_spending)}</div>
            <div className="text-gray-600 text-sm">Total Spending</div>
          </Card>

          <Card className="text-center">
            <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{bookingStats.total_bookings}</div>
            <div className="text-gray-600 text-sm">Total Bookings</div>
          </Card>

          <Card className="text-center">
            <Home className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{bookingStats.rental_bookings}</div>
            <div className="text-gray-600 text-sm">Rental Bookings</div>
          </Card>

          <Card className="text-center">
            <Eye className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{bookingStats.visit_bookings}</div>
            <div className="text-gray-600 text-sm">Visit Bookings</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Property Payments by Month - Stacked Bar Chart */}
          <Card className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Property Payments by Month</h2>
            {propertyList.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  {propertyList.map((property, index) => (
                    <Bar 
                      key={property} 
                      dataKey={property} 
                      stackId="a" 
                      fill={COLORS[index % COLORS.length]}
                      name={property}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No payment data available</p>
              </div>
            )}
          </Card>
        </div>

        {/* Property Payment Table */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Payment Details by Property and Month</h2>
          {tableData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((payment, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="info">{payment.month}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.property}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(payment.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="success">Paid</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No payment records found</p>
            </div>
          )}
        </Card>

        {/* Payment Summary Statistics */}
        {propertyList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center">
              <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {formatCurrency(tableData.reduce((sum, t) => sum + t.amount, 0))}
              </div>
              <div className="text-gray-600 text-sm">Total Paid</div>
            </Card>

            <Card className="text-center">
              <Home className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{propertyList.length}</div>
              <div className="text-gray-600 text-sm">Properties Paid</div>
            </Card>

            <Card className="text-center">
              <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {new Set(tableData.map(t => t.month)).size}
              </div>
              <div className="text-gray-600 text-sm">Active Months</div>
            </Card>

            <Card className="text-center">
              <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {formatCurrency(tableData.length > 0 ? Math.max(...tableData.map(t => t.amount)) : 0)}
              </div>
              <div className="text-gray-600 text-sm">Highest Payment</div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Key Insights */}
          <Card className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Key Insights</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <ArrowUpRight className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <div className="font-medium">Most Booked Property</div>
                    <div className="text-sm text-gray-600">{bookingStats.most_booked_property}</div>
                  </div>
                </div>
                <Badge variant="success">Popular</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <div className="font-medium">Average Spending</div>
                    <div className="text-sm text-gray-600">{formatCurrency(bookingStats.average_spending)}</div>
                  </div>
                </div>
                <Badge variant="info">Per Booking</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
                  <div>
                    <div className="font-medium">Booking Preference</div>
                    <div className="text-sm text-gray-600">
                      {bookingStats.rental_bookings > bookingStats.visit_bookings ? 'Rentals' : 'Visits'}
                    </div>
                  </div>
                </div>
                <Badge variant="warning">Trend</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <Target className="w-5 h-5 text-orange-600 mr-2" />
                  <div>
                    <div className="font-medium">Rent Comparison</div>
                    <div className="text-sm text-gray-600">
                      Your rent is {rentPriceTrends[rentPriceTrends.length - 1]?.your_rent < rentPriceTrends[rentPriceTrends.length - 1]?.area_avg ? 'below' : 'above'} area average
                    </div>
                  </div>
                </div>
                <Badge variant="success">Good Value</Badge>
              </div>
            </div>
          </Card>

          {/* Spending Summary */}
          <Card>
            <h2 className="text-xl font-semibold mb-6">Spending Summary</h2>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{formatCurrency(bookingStats.total_spending)}</div>
                <div className="text-sm text-gray-600">Total Spending</div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Average Monthly</span>
                  <span className="font-semibold">{formatCurrency(bookingStats.total_spending / 6)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Per Booking</span>
                  <span className="font-semibold">{formatCurrency(bookingStats.average_spending)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Highest Month</span>
                  <span className="font-semibold">{formatCurrency(Math.max(...spendingData.map(d => d.spending)))}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Activity Table */}
        <Card>
          <h2 className="text-xl font-semibold mb-6">Detailed Booking Activity</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start/Visit Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Move-in Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.slice(0, 10).map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.property_details?.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.property_details?.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={booking.booking_type === 'rental' ? 'success' : 'warning'}>
                        {booking.booking_type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.total_amount ? formatCurrency(booking.total_amount) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(booking.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.start_date || booking.visit_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.move_in_date ? formatDate(booking.move_in_date) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RenterAnalysis;
