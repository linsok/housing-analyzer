import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Home, Calendar, AlertTriangle, CheckCircle, XCircle, DollarSign, TrendingUp, Activity, Eye, Star, BarChart3, Users as UsersIcon } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { analyticsService } from '../services/analyticsService';
import api from '../services/api';
import { formatDate, formatCurrency } from '../utils/formatters';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsData, usersData, propertiesData, reportsData] = await Promise.all([
        analyticsService.getAdminDashboard(),
        api.get('/auth/users/pending_verifications/'),
        api.get('/properties/pending_verifications/'),
        api.get('/properties/reports/?status=pending'),
      ]);
      
      setAnalytics(analyticsData);
      setPendingVerifications(usersData.data.results || usersData.data);
      setPendingProperties(propertiesData.data.results || propertiesData.data);
      setPendingReports(reportsData.data.results || reportsData.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId, status) => {
    try {
      await api.post(`/auth/users/${userId}/verify/`, {
        verification_status: status,
      });
      loadDashboardData();
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  const handleVerifyProperty = async (propertyId, status) => {
    try {
      await api.post(`/properties/${propertyId}/verify/`, {
        verification_status: status,
      });
      loadDashboardData();
    } catch (error) {
      console.error('Error verifying property:', error);
    }
  };

  const handleReviewReport = async (reportId, status) => {
    try {
      await api.post(`/properties/reports/${reportId}/review/`, {
        status: status,
      });
      loadDashboardData();
    } catch (error) {
      console.error('Error reviewing report:', error);
    }
  };

  if (loading) return <Loading />;

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Prepare chart data
  const userRoleData = analytics ? [
    { name: 'Renters', value: analytics.users.renters, color: '#3B82F6' },
    { name: 'Owners', value: analytics.users.owners, color: '#10B981' },
    { name: 'Verified Owners', value: analytics.users.verified_owners, color: '#F59E0B' },
  ] : [];

  const propertyStatusData = analytics ? [
    { name: 'Available', value: analytics.properties.available, color: '#10B981' },
    { name: 'Rented', value: analytics.properties.rented, color: '#3B82F6' },
    { name: 'Pending', value: analytics.properties.pending, color: '#F59E0B' },
  ] : [];

  const bookingStatusData = analytics ? [
    { name: 'Confirmed', value: analytics.bookings.confirmed },
    { name: 'Pending', value: analytics.bookings.pending },
    { name: 'Completed', value: analytics.bookings.completed || 0 },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Platform overview and management</p>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4 mb-8">
          <Link to="/admin/customers">
            <Button variant="outline" className="flex items-center">
              <UsersIcon className="w-5 h-5 mr-2" />
              Customer Management
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        {analytics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Users</p>
                    <h3 className="text-3xl font-bold text-gray-900">{analytics.users.total}</h3>
                    <p className="text-xs text-green-600 mt-2">
                      +{analytics.users.new_last_30_days} this month
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Properties</p>
                    <h3 className="text-3xl font-bold text-gray-900">{analytics.properties.total}</h3>
                    <p className="text-xs text-yellow-600 mt-2">
                      {analytics.properties.pending} pending
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Home className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                    <h3 className="text-3xl font-bold text-gray-900">{analytics.bookings.total}</h3>
                    <p className="text-xs text-blue-600 mt-2">
                      {analytics.bookings.pending} pending
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Calendar className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Reports</p>
                    <h3 className="text-3xl font-bold text-gray-900">{analytics.reports.pending}</h3>
                    <p className="text-xs text-red-600 mt-2">
                      Needs attention
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* User Distribution Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  User Distribution
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="font-bold text-blue-600">{analytics.users.renters}</div>
                    <div className="text-gray-600">Renters</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-600">{analytics.users.owners}</div>
                    <div className="text-gray-600">Owners</div>
                  </div>
                  <div>
                    <div className="font-bold text-orange-600">{analytics.users.verified_owners}</div>
                    <div className="text-gray-600">Verified</div>
                  </div>
                </div>
              </Card>

              {/* Property Status Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Home className="w-5 h-5 mr-2 text-green-600" />
                  Property Status
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={propertyStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]}>
                      {propertyStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Booking Status Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Booking Status
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={bookingStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-orange-600" />
                  Quick Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium">Pending Verifications</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{analytics.users.pending_verifications}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Home className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium">Verified Properties</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{analytics.properties.verified}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-purple-600 mr-3" />
                      <span className="text-sm font-medium">New Bookings (30d)</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">{analytics.bookings.new_last_30_days}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                      <span className="text-sm font-medium">Pending Reports</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">{analytics.reports.pending}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* User Activity Analytics */}
            {analytics.user_activity && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">User Activity Analytics</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* User Signups (Last 30 Days) */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                      User Signups (Last 30 Days)
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={analytics.user_activity.signups_30_days}>
                        <defs>
                          <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <Area type="monotone" dataKey="signups" stroke="#10B981" fillOpacity={1} fill="url(#colorSignups)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* User Logins (Last 30 Days) */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-600" />
                      User Logins (Last 30 Days)
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={analytics.user_activity.logins_30_days}>
                        <defs>
                          <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <Area type="monotone" dataKey="logins" stroke="#3B82F6" fillOpacity={1} fill="url(#colorLogins)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* User Growth (6 Months) */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                      User Growth (6 Months)
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analytics.user_activity.growth_6_months}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="users" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Active Users */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-orange-600" />
                      Active Users (Last 7 Days)
                    </h3>
                    <div className="flex items-center justify-center h-[250px]">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-orange-600 mb-4">
                          {analytics.users.active_users}
                        </div>
                        <div className="text-gray-600 text-lg mb-6">Active Users</div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="font-bold text-blue-600 text-xl">{analytics.users.active_by_role.renters}</div>
                            <div className="text-gray-600">Renters</div>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="font-bold text-green-600 text-xl">{analytics.users.active_by_role.owners}</div>
                            <div className="text-gray-600">Owners</div>
                          </div>
                          <div className="p-3 bg-red-50 rounded-lg">
                            <div className="font-bold text-red-600 text-xl">{analytics.users.active_by_role.admins}</div>
                            <div className="text-gray-600">Admins</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            )}
          </>
        )}

        {/* Pending Actions */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Actions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending User Verifications */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Pending User Verifications
              {pendingVerifications.length > 0 && (
                <Badge variant="warning" className="ml-2">{pendingVerifications.length}</Badge>
              )}
            </h2>
            
            {pendingVerifications.length === 0 ? (
              <p className="text-gray-600 text-sm">No pending verifications</p>
            ) : (
              <div className="space-y-3">
                {pendingVerifications.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{user.full_name || user.username}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <Badge variant="info" className="mt-1">{user.role}</Badge>
                      </div>
                    </div>
                    
                    {user.id_document && (
                      <div className="mb-2">
                        <a
                          href={user.id_document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:underline"
                        >
                          View ID Document
                        </a>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleVerifyUser(user.id, 'verified')}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleVerifyUser(user.id, 'rejected')}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pending Property Verifications */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2 text-green-600" />
              Pending Property Verifications
              {pendingProperties.length > 0 && (
                <Badge variant="warning" className="ml-2">{pendingProperties.length}</Badge>
              )}
            </h2>
            
            {pendingProperties.length === 0 ? (
              <p className="text-gray-600 text-sm">No pending properties</p>
            ) : (
              <div className="space-y-3">
                {pendingProperties.map((property) => (
                  <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex gap-3 mb-3">
                      {property.primary_image && (
                        <img
                          src={property.primary_image}
                          alt={property.title}
                          className="w-20 h-20 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{property.title}</h4>
                        <p className="text-sm text-gray-600">{property.city}</p>
                        <p className="text-sm text-gray-600">
                          Owner: {property.owner_name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleVerifyProperty(property.id, 'verified')}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleVerifyProperty(property.id, 'rejected')}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pending Reports */}
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Pending Reports
              {pendingReports.length > 0 && (
                <Badge variant="error" className="ml-2">{pendingReports.length}</Badge>
              )}
            </h2>
            
            {pendingReports.length === 0 ? (
              <p className="text-gray-600 text-sm">No pending reports</p>
            ) : (
              <div className="space-y-3">
                {pendingReports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{report.property_title}</h4>
                        <p className="text-sm text-gray-600">
                          Reported by: {report.reported_by?.full_name}
                        </p>
                        <Badge variant="warning" className="mt-1">{report.reason}</Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(report.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{report.description}</p>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReviewReport(report.id, 'reviewing')}
                        variant="outline"
                      >
                        Under Review
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReviewReport(report.id, 'resolved')}
                      >
                        Resolve & Remove Property
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReviewReport(report.id, 'dismissed')}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
