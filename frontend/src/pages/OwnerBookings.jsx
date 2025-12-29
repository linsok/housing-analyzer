import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, User, Phone, Mail, Home, Users, DollarSign, 
  CheckCircle, XCircle, Clock, AlertCircle, Filter, Search,
  MessageCircle, Eye, Download, CreditCard
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { bookingService } from '../services/bookingService';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptImage, setSelectedReceiptImage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  useEffect(() => {
    console.log('Modal state:', { showDetailsModal, selectedBooking });
  }, [showDetailsModal, selectedBooking]);

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
        booking.renter_details?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.property_details?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.renter_details?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.renter_details?.phone?.includes(searchTerm)
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

  const handleConfirmBooking = async (bookingId) => {
    setActionLoading(true);
    try {
      await bookingService.confirmBooking(bookingId);
      toast.success('Booking confirmed successfully');
      loadBookings();
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast.error('Failed to confirm booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    setActionLoading(true);
    try {
      await bookingService.cancelBooking(bookingId);
      toast.success('Booking rejected successfully');
      loadBookings();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    setActionLoading(true);
    try {
      await bookingService.completeBooking(bookingId);
      toast.success('Booking marked as completed');
      loadBookings();
    } catch (error) {
      console.error('Error completing booking:', error);
      toast.error('Failed to complete booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReview = async (bookingId) => {
    setActionLoading(true);
    try {
      // Use the existing confirmBooking method to approve the transaction review
      await bookingService.confirmBooking(bookingId, 'Transaction review confirmed');
      toast.success('Transaction review confirmed');
      loadBookings();
    } catch (error) {
      console.error('Error confirming review:', error);
      toast.error('Failed to confirm review');
    } finally {
      setActionLoading(false);
    }
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
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const variants = {
      rental: 'primary',
      visit: 'secondary'
    };
    const icons = {
      rental: <Home className="w-3 h-3" />,
      visit: <Calendar className="w-3 h-3" />
    };
    
    return (
      <Badge variant={variants[type] || 'default'} className="flex items-center gap-1">
        {icons[type]}
        {type === 'rental' ? 'Room Rental' : 'Property Visit'}
      </Badge>
    );
  };

  const showBookingDetails = (booking) => {
    console.log('Opening booking details:', booking);
    console.log('Booking status:', booking.status);
    console.log('Has transaction image:', !!booking.transaction_image);
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const openReceiptModal = (imageUrl) => {
    setSelectedReceiptImage(imageUrl);
    setShowReceiptModal(true);
  };

  const exportBookings = () => {
    const csvContent = [
      ['Booking ID', 'Renter Name', 'Email', 'Phone', 'Property', 'Type', 'Status', 'Date', 'Amount'].join(','),
      ...filteredBookings.map(booking => [
        booking.id,
        booking.renter_details?.full_name || 'N/A',
        booking.renter_details?.email || 'N/A',
        booking.renter_details?.phone || 'N/A',
        booking.property_details?.title || 'N/A',
        booking.booking_type,
        booking.status,
        booking.start_date || booking.visit_time,
        booking.total_amount || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
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
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600 mt-1">Manage all booking requests and reservations</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportBookings}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Link to="/owner/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <Calendar className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'pending' || b.status === 'pending_review').length}</div>
            <div className="text-gray-600 text-sm">Pending</div>
          </Card>
          <Card className="text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'confirmed').length}</div>
            <div className="text-gray-600 text-sm">Confirmed</div>
          </Card>
          <Card className="text-center">
            <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'completed').length}</div>
            <div className="text-gray-600 text-sm">Completed</div>
          </Card>
          <Card className="text-center">
            <Home className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{bookings.length}</div>
            <div className="text-gray-600 text-sm">Total Rentals</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, property..."
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
          <h2 className="text-xl font-semibold mb-6">All Bookings</h2>
          
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No bookings found</p>
              <p className="text-sm mt-2">
                {searchTerm || statusFilter !== 'all' || dateFilter
                  ? 'Try adjusting your filters' 
                  : 'When you receive booking requests, they will appear here'
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
                          {booking.renter_details?.full_name || 'Unknown Renter'}
                        </h3>
                        {getTypeBadge(booking.booking_type)}
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {booking.renter_details?.email || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {booking.renter_details?.phone || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Home className="w-4 h-4" />
                          {booking.property_details?.title || 'Unknown Property'}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {booking.booking_type === 'rental' 
                              ? `Move-in: ${formatDate(booking.start_date)}`
                              : `Visit: ${formatDate(booking.visit_time)}`
                            }
                          </span>
                          {booking.booking_type === 'rental' && booking.member_count && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {booking.member_count} occupants
                            </span>
                          )}
                        </div>
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
                      {booking.booking_type === 'rental' && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded text-sm">
                          <p className="font-medium text-yellow-800 mb-2">Payment Information:</p>
                          {booking.transaction_image ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Transaction Receipt:</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openReceiptModal(booking.transaction_image)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Receipt
                                </Button>
                              </div>
                              <div className="text-xs text-gray-600">
                                Submitted: {formatDate(booking.transaction_submitted_at || booking.created_at)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-yellow-700">
                              <AlertCircle className="w-4 h-4 inline mr-1" />
                              No transaction receipt uploaded yet
                            </div>
                          )}
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
                    
                    <div className="flex gap-2">
                      {/* Pending status - show Confirm Review button if transaction exists */}
                      {(booking.status === 'pending' || booking.status === 'pending_review') && booking.transaction_image && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleConfirmReview(booking.id)}
                            disabled={actionLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Confirm 
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectBooking(booking.id)}
                            disabled={actionLoading}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {/* Pending status without transaction - waiting indicator */}
                      {(booking.status === 'pending' || booking.status === 'pending_review') && !booking.transaction_image && (
                        <div className="text-xs text-yellow-600">
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          Waiting for receipt
                        </div>
                      )}
                      
                      {/* Review confirmed status - show Confirm Booking button */}
                      {booking.status === 'review_confirmed' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleConfirmBooking(booking.id)}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm Booking
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectBooking(booking.id)}
                            disabled={actionLoading}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {/* Confirmed status - show Mark Complete button for rentals */}
                      {booking.status === 'confirmed' && booking.booking_type === 'rental' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteBooking(booking.id)}
                          disabled={actionLoading}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
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
                  {/* Summary Table */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Booking Summary
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 w-1/3">Renter Name</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{selectedBooking.renter_details?.full_name || 'N/A'}</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Email</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{selectedBooking.renter_details?.email || 'N/A'}</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Contact</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{selectedBooking.renter_details?.phone || 'N/A'}</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Move-in Date</td>
                            <td className="px-6 py-3 text-sm text-gray-700">
                              {selectedBooking.booking_type === 'rental' 
                                ? formatDate(selectedBooking.start_date)
                                : formatDate(selectedBooking.visit_time)
                              }
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Occupation</td>
                            <td className="px-6 py-3 text-sm text-gray-700">
                              {selectedBooking.member_count ? `${selectedBooking.member_count} occupants` : 'N/A'}
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Monthly Rent</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{formatCurrency(selectedBooking.property_details?.rent_price || selectedBooking.monthly_rent)}</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Deposit</td>
                            <td className="px-6 py-3 text-sm text-gray-700">
                              {selectedBooking.deposit_amount ? formatCurrency(selectedBooking.deposit_amount) : 'N/A'}
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Booking Payment</td>
                            <td className="px-6 py-3 text-sm text-gray-700">
                              {selectedBooking.total_amount ? formatCurrency(selectedBooking.total_amount) : 'N/A'}
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Booking Submitted</td>
                            <td className="px-6 py-3 text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                {formatDateTime(selectedBooking.created_at)}
                              </div>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Transaction Review</td>
                            <td className="px-6 py-3 text-sm text-gray-700">
                              {selectedBooking.transaction_image ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-green-600">Receipt uploaded</span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openReceiptModal(selectedBooking.transaction_image)}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      View
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Clock className="w-3 h-3" />
                                    Submitted: {formatDateTime(selectedBooking.transaction_submitted_at || selectedBooking.updated_at)}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                                  <span className="text-yellow-600">No receipt uploaded</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

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
                      {selectedBooking.property_details?.rent_price && (
                        <div><strong>Monthly Rent:</strong> {formatCurrency(selectedBooking.property_details.rent_price)}</div>
                      )}
                    </div>
                  </div>

                  {/* Payment Method & QR Code */}
                  {selectedBooking.booking_type === 'rental' && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Payment Information
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div><strong>Payment Method:</strong> Bakong KHQR</div>
                        <div><strong>Payment Status:</strong> 
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                            selectedBooking.status === 'confirmed' || selectedBooking.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : selectedBooking.status === 'pending_review'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedBooking.status === 'confirmed' || selectedBooking.status === 'completed' 
                              ? 'Paid' 
                              : selectedBooking.status === 'pending_review'
                              ? 'Pending Review'
                              : selectedBooking.status
                            }
                          </span>
                        </div>
                        
                        {/* QR Code Display */}
                        {selectedBooking.property_details?.images?.some(img => img.is_qr_code) && (
                          <div>
                            <strong>Property QR Code:</strong>
                            <div className="mt-2 p-2 bg-white rounded border inline-block">
                              <img 
                                src={selectedBooking.property_details.images.find(img => img.is_qr_code)?.image} 
                                alt="Property Payment QR Code" 
                                className="w-32 h-32 object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  {selectedBooking.message && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Message from Renter
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{selectedBooking.message}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    {(selectedBooking.status === 'pending' || selectedBooking.status === 'pending_review') && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span>Pending review - review transaction receipt first</span>
                      </div>
                    )}
                    {selectedBooking.status === 'review_confirmed' && (
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span>Review confirmed - ready for booking confirmation</span>
                      </div>
                    )}
                    {selectedBooking.status === 'confirmed' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Booking confirmed</span>
                      </div>
                    )}
                    {selectedBooking.status === 'completed' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span>Booking completed</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetailsModal(false)}
                    >
                      Close
                    </Button>
                    
                    {/* Pending status - show Confirm Review button */}
                    {(selectedBooking.status === 'pending' || selectedBooking.status === 'pending_review') && selectedBooking.transaction_image && (
                      <>
                        <Button
                          onClick={() => {
                            handleConfirmReview(selectedBooking.id);
                          }}
                          disabled={actionLoading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Confirm Review
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            handleRejectBooking(selectedBooking.id);
                            setShowDetailsModal(false);
                          }}
                          disabled={actionLoading}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {/* Pending status without transaction receipt */}
                    {(selectedBooking.status === 'pending' || selectedBooking.status === 'pending_review') && !selectedBooking.transaction_image && (
                      <div className="text-sm text-yellow-600">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Waiting for transaction receipt
                      </div>
                    )}
                    
                    {/* Review confirmed status - show Confirm Booking button */}
                    {selectedBooking.status === 'review_confirmed' && (
                      <>
                        <Button
                          onClick={() => {
                            handleConfirmBooking(selectedBooking.id);
                            setShowDetailsModal(false);
                          }}
                          disabled={actionLoading}
                          className="bg-green-600 hover:bg-green-700 px-6"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Booking
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            handleRejectBooking(selectedBooking.id);
                            setShowDetailsModal(false);
                          }}
                          disabled={actionLoading}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {/* Confirmed status - show Mark Complete button for rentals */}
                    {selectedBooking.status === 'confirmed' && selectedBooking.booking_type === 'rental' && (
                      <Button
                        onClick={() => {
                          handleCompleteBooking(selectedBooking.id);
                          setShowDetailsModal(false);
                        }}
                        disabled={actionLoading}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceiptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-semibold">Transaction Receipt</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReceiptModal(false)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <img 
                  src={selectedReceiptImage} 
                  alt="Transaction receipt" 
                  className="max-w-full h-auto mx-auto object-contain"
                />
              </div>
              <div className="p-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowReceiptModal(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerBookings;
