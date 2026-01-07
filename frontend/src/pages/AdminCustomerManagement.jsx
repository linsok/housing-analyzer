import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import { formatDate } from '../utils/formatters';
import { Search, Filter, LogOut, Users, History, CheckCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import api from '../services/api';

const AdminCustomerManagement = () => {
  const [activeCustomers, setActiveCustomers] = useState([]);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [hiddenCustomers, setHiddenCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchActive, setSearchActive] = useState('');
  const [searchHistory, setSearchHistory] = useState('');
  const [searchHidden, setSearchHidden] = useState('');

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      
      // Fetch all customer data (admin sees all records including hidden)
      const [activeResponse, historyResponse, hiddenResponse] = await Promise.all([
        api.get('/bookings/', { params: { booking_type: 'rental', status: 'confirmed' } }),
        api.get('/bookings/', { params: { booking_type: 'rental', status: 'completed' } }),
        api.get('/bookings/', { params: { booking_type: 'rental', hidden_by_owner: true } })
      ]);

      const activeBookings = activeResponse.data.results || activeResponse.data;
      const historyBookings = historyResponse.data.results || historyResponse.data;
      const hiddenBookings = hiddenResponse.data.results || hiddenResponse.data;

      const transformedActive = activeBookings.map(booking => transformBookingToCustomer(booking));
      const transformedHistory = historyBookings.map(booking => transformBookingToCustomer(booking));
      const transformedHidden = hiddenBookings.map(booking => ({ ...transformBookingToCustomer(booking), hidden: true }));

      setActiveCustomers(transformedActive);
      setCustomerHistory(transformedHistory);
      setHiddenCustomers(transformedHidden);
      
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const transformBookingToCustomer = (booking) => {
    return {
      id: booking.id,
      renter_name: booking.renter_details?.full_name || booking.renter_details?.username || 'Unknown',
      email: booking.renter_details?.email || 'N/A',
      phone_number: booking.contact_phone || booking.renter_details?.phone_number || 'N/A',
      move_in_date: booking.start_date || booking.confirmed_at,
      property_name: booking.property_details?.title || 'Unknown Property',
      monthly_payment: parseFloat(booking.monthly_rent || booking.property_details?.rent_price || 0),
      status: booking.status === 'confirmed' ? 'still living' : booking.status,
      check_out_date: booking.completed_at || booking.updated_at || booking.end_date,
      booking_id: booking.id,
      property_owner: booking.property_details?.owner?.full_name || booking.property_details?.owner?.username || 'Unknown',
      hidden_by_owner: booking.hidden_by_owner || false
    };
  };

  const handleCheckOut = async (customerId) => {
    try {
      await api.post(`/bookings/${customerId}/checkout/`);
      await loadCustomerData();
      alert('Customer checked out successfully');
    } catch (error) {
      console.error('Error checking out customer:', error);
      alert('Failed to check out customer');
    }
  };

  const handleRestoreHidden = async (customerId) => {
    try {
      await api.patch(`/bookings/${customerId}/`, { hidden_by_owner: false });
      await loadCustomerData();
      alert('Customer record restored successfully');
    } catch (error) {
      console.error('Error restoring customer:', error);
      alert('Failed to restore customer record');
    }
  };

  const filteredActiveCustomers = activeCustomers.filter(customer => {
    const matchesSearch = !searchActive || 
      customer.renter_name.toLowerCase().includes(searchActive.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchActive.toLowerCase()) ||
      customer.property_name.toLowerCase().includes(searchActive.toLowerCase());
    return matchesSearch;
  });

  const filteredCustomerHistory = customerHistory.filter(customer => {
    const matchesSearch = !searchHistory || 
      customer.renter_name.toLowerCase().includes(searchHistory.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchHistory.toLowerCase()) ||
      customer.property_name.toLowerCase().includes(searchHistory.toLowerCase());
    return matchesSearch;
  });

  const filteredHiddenCustomers = hiddenCustomers.filter(customer => {
    const matchesSearch = !searchHidden || 
      customer.renter_name.toLowerCase().includes(searchHidden.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchHidden.toLowerCase()) ||
      customer.property_name.toLowerCase().includes(searchHidden.toLowerCase());
    return matchesSearch;
  });

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
            <p className="text-gray-600 mt-2">Manage all customer records and checkouts</p>
          </div>
          <Button onClick={loadCustomerData} className="flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Active Customers */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold">Active Customers</h2>
            </div>
            <Badge variant="success" className="ml-2">
              {activeCustomers.length} Active
            </Badge>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or property..."
                value={searchActive}
                onChange={(e) => setSearchActive(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {filteredActiveCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No active customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renter Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Move In Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredActiveCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.renter_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(customer.move_in_date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.property_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">${customer.monthly_payment}/mo</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.property_owner}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button size="sm" variant="outline" onClick={() => handleCheckOut(customer.id)} className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50">
                          <LogOut className="w-4 h-4 mr-1" />
                          Check Out
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Customer History */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <History className="w-6 h-6 text-gray-600 mr-3" />
              <h2 className="text-xl font-semibold">Customer History</h2>
            </div>
            <Badge variant="secondary" className="ml-2">
              {customerHistory.length} Past Customers
            </Badge>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or property..."
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {filteredCustomerHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No customer history found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renter Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Move In Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Owner</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomerHistory.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.renter_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(customer.move_in_date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.property_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">${customer.monthly_payment}/mo</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-gray-400 mr-1" />
                          {formatDate(customer.check_out_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.property_owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Hidden Customers */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <EyeOff className="w-6 h-6 text-orange-600 mr-3" />
              <h2 className="text-xl font-semibold">Hidden Customer Records</h2>
            </div>
            <Badge variant="warning" className="ml-2">
              {hiddenCustomers.length} Hidden
            </Badge>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or property..."
                value={searchHidden}
                onChange={(e) => setSearchHidden(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {filteredHiddenCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <EyeOff className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No hidden customer records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renter Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHiddenCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 bg-orange-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.renter_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.property_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.property_owner}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="warning">Hidden</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button size="sm" onClick={() => handleRestoreHidden(customer.id)} className="flex items-center text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                          <Eye className="w-4 h-4 mr-1" />
                          Restore
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminCustomerManagement;
