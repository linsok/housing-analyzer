import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, Calendar, User, Phone, Mail, DollarSign, CheckCircle, 
  XCircle, Clock, AlertCircle, Filter, Search, Eye, Download
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { bookingService } from '../services/bookingService';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyRoomBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const loadBookings = async () => {
    try {
      const data = await bookingService.getBookings({ booking_type: 'rental' });
      setBookings(data.results || data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.property_details?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.property_details?.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredBookings(filtered);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      pending_review: 'warning',
      review_confirmed: 'primary',
      confirmed: 'success',
      completed: 'info',
      cancelled: 'error',
      rejected: 'error'
    };
    const icons = {
      pending: <Clock className="w-3 h-3" />,
      pending_review: <Clock className="w-3 h-3" />,
      review_confirmed: <Eye className="w-3 h-3" />,
      confirmed: <CheckCircle className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />
    };
    
    return (
      <Badge variant={variants[status] || 'default'} className="flex items-center gap-1">
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const showBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const exportBookings = () => {
    const csvContent = [
      ['Booking ID', 'Property', 'Status', 'Move-in Date', 'Monthly Rent', 'Deposit', 'Total Amount', 'Booked On'].join(','),
      ...filteredBookings.map(booking => [
        booking.id,
        booking.property_details?.title || 'N/A',
        booking.status,
        booking.start_date || 'N/A',
        booking.monthly_rent || 'N/A',
        booking.deposit_amount || 'N/A',
        booking.total_amount || 'N/A',
        booking.created_at
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `room_bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Room Bookings</h1>
            <p className="text-gray-600 mt-1">Manage your room rental bookings and reservations</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportBookings}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Link to="/renter/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'pending' || b.status === 'pending_review').length}</div>
            <div className="text-gray-600 text-sm">Pending</div>
          </Card>
          <Card className="text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'confirmed').length}</div>
            <div className="text-gray-600 text-sm">Confirmed</div>
          </Card>
          <Card className="text-center">
            <Home className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'completed').length}</div>
            <div className="text-gray-600 text-sm">Completed</div>
          </Card>
          <Card className="text-center">
            <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{bookings.length}</div>
            <div className="text-gray-600 text-sm">Total Bookings</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by property name, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="pending_review">Pending Review</option>
              <option value="review_confirmed">Review Confirmed</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Filter by date"
            />

            <div className="flex items-center text-sm text-gray-600">
              <Filter className="w-4 h-4 mr-2" />
              {filteredBookings.length} of {bookings.length} bookings
            </div>
          </div>
        </Card>

        {/* Bookings List */}
        <Card>
          <h2 className="text-xl font-semibold mb-6">Room Rental Bookings</h2>
          
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No room bookings found</p>
              <p className="text-sm mt-2">
                {searchTerm || statusFilter !== 'all' || dateFilter
                  ? 'Try adjusting your filters' 
                  : 'When you book rooms, they will appear here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {booking.property_details?.title || 'Unknown Property'}
                        </h3>
                        <Badge variant="primary" className="flex items-center gap-1">
                          <Home className="w-3 h-3" />
                          Room Rental
                        </Badge>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <Home className="w-4 h-4" />
                          {booking.property_details?.address || 'No address'}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Move-in: {formatDate(booking.start_date)}
                          </span>
                          {booking.end_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              End: {formatDate(booking.end_date)}
                            </span>
                          )}
                        </div>
                        {booking.member_count && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {booking.member_count} occupants
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          Booked on: {formatDateTime(booking.created_at)}
                        </div>
                        {booking.total_amount && (
                          <div className="flex items-center gap-1 font-medium text-green-600">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(booking.total_amount)}
                            {booking.deposit_amount && (
                              <span className="text-sm text-gray-500">
                                (Deposit: {formatCurrency(booking.deposit_amount)})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {booking.message && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          <p className="font-medium text-gray-700 mb-1">Message:</p>
                          <p className="text-gray-600">{booking.message}</p>
                        </div>
                      )}
                      
                      {/* Transaction Information */}
                      {booking.transaction_image && (
                        <div className="mt-3 p-3 bg-green-50 rounded text-sm">
                          <p className="font-medium text-green-800 mb-2">Payment Information:</p>
                          <div className="flex items-center justify-between">
                            <span className="text-green-600">Transaction Receipt Uploaded</span>
                            <span className="text-xs text-green-600">
                              Submitted: {formatDate(booking.transaction_submitted_at || booking.created_at)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => showBookingDetails(booking)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Booking Details Modal */}
        {showDetailsModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Booking Details</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Property Details */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      Property Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div><strong>Property:</strong> {selectedBooking.property_details?.title || 'N/A'}</div>
                      <div><strong>Address:</strong> {selectedBooking.property_details?.address || 'N/A'}</div>
                      <div><strong>City:</strong> {selectedBooking.property_details?.city || 'N/A'}</div>
                      <div><strong>Type:</strong> {selectedBooking.property_details?.property_type || 'N/A'}</div>
                      <div><strong>Owner Phone:</strong> {selectedBooking.property_details?.owner_phone || 'Not provided'}</div>
                    </div>
                  </div>

                  {/* Booking Information */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Booking Information
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 w-1/3">Move-in Date</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{formatDate(selectedBooking.start_date)}</td>
                          </tr>
                          {selectedBooking.end_date && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-3 text-sm font-medium text-gray-900">End Date</td>
                              <td className="px-6 py-3 text-sm text-gray-700">{formatDate(selectedBooking.end_date)}</td>
                            </tr>
                          )}
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Occupants</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{selectedBooking.member_count || 1}</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Monthly Rent</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{formatCurrency(selectedBooking.property_details?.rent_price || selectedBooking.monthly_rent)}</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Deposit</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{formatCurrency(selectedBooking.deposit_amount)}</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Total Amount</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{formatCurrency(selectedBooking.total_amount)}</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Status</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{getStatusBadge(selectedBooking.status)}</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Booked On</td>
                            <td className="px-6 py-3 text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                {formatDateTime(selectedBooking.created_at)}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Message */}
                  {selectedBooking.message && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Your Message
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{selectedBooking.message}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end items-center mt-6 pt-6 border-t">
                  <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRoomBookings;
