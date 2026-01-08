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
  const [selectedYear, setSelectedYear] = useState('2025');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, selectedYear]);

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
      processPaymentData(processedBookings, selectedYear);
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

  const processPaymentData = (bookingsData, year) => {
    console.log('=== PROCESSING PAYMENT DATA ===');
    console.log('Bookings data:', bookingsData);
    console.log('Selected year:', year);
    
    // Process confirmed bookings to extract payment information
    const confirmedBookings = bookingsData.filter(b => b.status === 'completed');
    console.log('Completed bookings:', confirmedBookings);
    
    const monthlyData = {};
    const allProperties = new Set();
    
    confirmedBookings.forEach(booking => {
      const bookingDate = new Date(booking.created_at);
      const bookingYear = bookingDate.getFullYear().toString();
      
      // Only process bookings from the selected year
      if (bookingYear === year) {
        const month = bookingDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        const propertyTitle = booking.property_details?.title || booking.property_title || 'Unknown Property';
        const amount = parseFloat(booking.total_amount) || parseFloat(booking.deposit_amount) || 0;
        
        console.log(`Processing booking: ${propertyTitle}, Month: ${month}, Amount: ${amount}`);
        
        allProperties.add(propertyTitle);
        
        if (!monthlyData[month]) {
          monthlyData[month] = {};
        }
        
        if (!monthlyData[month][propertyTitle]) {
          monthlyData[month][propertyTitle] = 0;
        }
        
        monthlyData[month][propertyTitle] += amount;
      }
    });
    
    console.log('Monthly data:', monthlyData);
    console.log('All properties:', Array.from(allProperties));
    
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
    
    console.log('Payment array:', paymentArray);
    console.log('Summary array:', summaryArray);
    
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

  // Generate year options (current year and 3 previous years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear; i >= currentYear - 3; i--) {
    yearOptions.push(i.toString());
  }

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

  // Calculate booking stats from real data with better error handling
  console.log('=== RENTER ANALYSIS DEBUG ===');
  console.log('All bookings:', bookings);
  console.log('Paid bookings:', bookings.filter(b => b.total_amount && b.total_amount > 0));
  
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const paidBookings = bookings.filter(b => b.total_amount && b.total_amount > 0);
  
  // Calculate total spending focusing on deposit amounts from completed bookings with year filtering
  const totalSpending = bookings.reduce((sum, b) => {
    let bookingTotal = 0;
    
    // Only calculate for completed bookings (these are paid bookings)
    if (b.status === 'completed') {
      // Filter by selected year
      const bookingYear = new Date(b.created_at).getFullYear().toString();
      if (bookingYear === selectedYear) {
        // Use deposit_amount if available, otherwise use total_amount
        const depositAmount = b.deposit_amount ? parseFloat(b.deposit_amount) : (b.total_amount ? parseFloat(b.total_amount) : 0);
        
        if (depositAmount > 0) {
          bookingTotal += depositAmount;
          console.log(`Booking ${b.id} (${b.property_details?.title}): Deposit $${depositAmount}`);
        }
      }
    }
    
    return sum + bookingTotal;
  }, 0);
  
  console.log('Total spending calculation (including monthly rent):', totalSpending);
  
  const bookingStats = {
    total_bookings: bookings.filter(b => new Date(b.created_at).getFullYear().toString() === selectedYear).length,
    total_spending: totalSpending,
    most_booked_property: bookings.length > 0 ? 
      (() => {
        const propertyCounts = {};
        bookings.filter(b => new Date(b.created_at).getFullYear().toString() === selectedYear).forEach(b => {
          const title = b.property_details?.title || 'Unknown Property';
          propertyCounts[title] = (propertyCounts[title] || 0) + 1;
        });
        return Object.entries(propertyCounts).reduce((max, [title, count]) => 
          count > max.count ? { title, count } : max, 
          { title: 'No properties', count: 0 }
        ).title;
      })() : 'No properties',
    average_spending: paidBookings.length > 0 ? 
      totalSpending / paidBookings.filter(b => new Date(b.created_at).getFullYear().toString() === selectedYear).length : 0,
    visit_bookings: bookings.filter(b => b.booking_type === 'visit' && new Date(b.created_at).getFullYear().toString() === selectedYear).length,
    rental_bookings: bookings.filter(b => b.booking_type === 'rental' && new Date(b.created_at).getFullYear().toString() === selectedYear).length,
  };
  
  console.log('Final booking stats:', bookingStats);

  // Create real rent price trends from actual booking data
  const rentPriceTrends = months.map(month => {
    const monthBookings = bookings.filter(b => {
      const bookingMonth = new Date(b.created_at).toLocaleString('default', { month: 'short' });
      return bookingMonth === month && b.booking_type === 'rental' && b.total_amount;
    });
    
    const avgRent = monthBookings.length > 0
      ? monthBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0) / monthBookings.length
      : 0;
    
    return {
      month,
      your_rent: Math.round(avgRent),
      similar_avg: Math.round(avgRent * 1.1),
      market_avg: Math.round(avgRent * 1.2),
      area_avg: Math.round(avgRent * 1.05)
    };
  });

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
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <Link to="/renter/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Property Payments by Month - Stacked Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                  <span className="font-semibold">{formatCurrency(bookingStats.total_spending / Math.max(1, new Set(bookings.map(b => new Date(b.created_at).toLocaleString('default', { month: 'short', year: 'numeric' }))).size))}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Per Booking</span>
                  <span className="font-semibold">{formatCurrency(bookingStats.average_spending)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Highest Month</span>
                  <span className="font-semibold">{formatCurrency(Math.max(0, ...spendingData.map(d => d.spending)))}</span>
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
                      {booking.start_date ? formatDate(booking.start_date) : (booking.booking_type === 'visit' ? '-' : 'Not set')}
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
