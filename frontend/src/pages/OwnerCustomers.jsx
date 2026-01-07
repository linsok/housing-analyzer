import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import { formatDate } from '../utils/formatters';
import { Search, Filter, LogOut, Users, History, CheckCircle, Trash2 } from 'lucide-react';
import { customerService } from '../services/customerService';

const OwnerCustomers = () => {
  const [activeCustomers, setActiveCustomers] = useState([]);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');
  const [historyFilter, setHistoryFilter] = useState('');
  const [searchActive, setSearchActive] = useState('');
  const [searchHistory, setSearchHistory] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCustomerId, setDeleteCustomerId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading customer data...');
      
      // Fetch real data from API
      const [activeBookingsResponse, historyResponse] = await Promise.all([
        customerService.getActiveCustomers(),
        customerService.getCustomerHistory()
      ]);

      console.log('Active bookings response:', activeBookingsResponse);
      console.log('Customer history response:', historyResponse);
      
      // Handle different response structures
      const activeBookings = activeBookingsResponse.results || activeBookingsResponse || [];
      const historyBookings = historyResponse.results || historyResponse || [];

      console.log('Active bookings count:', activeBookings.length);
      console.log('History bookings count:', historyBookings.length);

      const transformedActiveCustomers = activeBookings.map(booking => 
        customerService.transformBookingToCustomer(booking)
      );

      const transformedCustomerHistory = historyBookings.map(booking => 
        customerService.transformBookingToCustomer(booking)
      );

      console.log('Setting active customers:', transformedActiveCustomers);
      console.log('Setting customer history:', transformedCustomerHistory);

      setActiveCustomers(transformedActiveCustomers);
      setCustomerHistory(transformedCustomerHistory);
      
    } catch (error) {
      console.error('Error loading customer data:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Show more specific error message
      let errorMessage = 'Failed to load customer data. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Permission denied. You do not have access to customer data.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (customerId) => {
    try {
      console.log('Checking out customer:', customerId);
      
      // Call API to complete the booking
      await customerService.checkOutCustomer(customerId);
      
      console.log('Checkout successful, waiting a moment before refresh...');
      
      // Add a small delay to ensure backend has processed the change
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh data after checkout
      await loadCustomerData();
      
      console.log('Data refreshed after checkout');
      
      alert(`Customer checked out successfully at ${new Date().toLocaleString()}`);
    } catch (error) {
      console.error('Error checking out customer:', error);
      alert('Failed to check out customer. Please try again.');
    }
  };

  const handleDeleteHistory = async (customerId) => {
    setDeleteCustomerId(customerId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      console.log('Hiding customer history for ID:', deleteCustomerId);
      
      // Call API to hide the booking record
      await customerService.deleteCustomerHistory(deleteCustomerId);
      
      console.log('Hide successful, refreshing data...');
      
      // Refresh data after hiding
      await loadCustomerData();
      
      // Show success modal instead of alert
      setSuccessMessage('Customer history record deleted successfully.');
      setShowSuccessModal(true);
      setShowDeleteModal(false);
      setDeleteCustomerId(null);
    } catch (error) {
      console.error('Error hiding customer history:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Failed to delete customer history: ${errorMessage}`);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteCustomerId(null);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage('');
  };

  const filteredActiveCustomers = activeCustomers.filter(customer => {
    const matchesSearch = !searchActive || 
      customer.renter_name.toLowerCase().includes(searchActive.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchActive.toLowerCase()) ||
      customer.property_name.toLowerCase().includes(searchActive.toLowerCase());
    
    const matchesFilter = !activeFilter || customer.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const filteredCustomerHistory = customerHistory.filter(customer => {
    const matchesSearch = !searchHistory || 
      customer.renter_name.toLowerCase().includes(searchHistory.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchHistory.toLowerCase()) ||
      customer.property_name.toLowerCase().includes(searchHistory.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-2">Manage your current and past renters</p>
        </div>

        {/* Available Customers Living In */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold">Available Customer Living In</h2>
            </div>
            <Badge variant="success" className="ml-2">
              {activeCustomers.length} Active
            </Badge>
          </div>

          {/* Filters for Active Customers */}
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
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">All Status</option>
                <option value="still living">Still Living</option>
              </select>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Renter Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Move In Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredActiveCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {customer.renter_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(customer.move_in_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.property_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${customer.monthly_payment}/mo
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="success">{customer.status}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCheckOut(customer.id)}
                          className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
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
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <History className="w-6 h-6 text-gray-600 mr-3" />
              <h2 className="text-xl font-semibold">Customer History</h2>
            </div>
            <Badge variant="secondary" className="ml-2">
              {customerHistory.length} Past Customers
            </Badge>
          </div>

          {/* Filters for Customer History */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Renter Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Move In Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomerHistory.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {customer.renter_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(customer.move_in_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.property_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${customer.monthly_payment}/mo
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-gray-400 mr-1" />
                          {formatDate(customer.check_out_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteHistory(customer.id)}
                          className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this customer history record?</p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Success</h3>
              </div>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              <div className="flex justify-end">
                <Button
                  onClick={closeSuccessModal}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  OK
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerCustomers;
