import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, User, Home, Phone, MessageCircle,
  CheckCircle, XCircle, AlertCircle, Eye, Filter
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import { bookingService } from '../services/bookingService';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency, formatDate } from '../utils/formatters';

const BookingRequests = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadBookings();
  }, [isAuthenticated]);

  const loadBookings = async () => {
    try {
      const data = await bookingService.getBookings();
      setBookings(data.results || data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      await bookingService.confirmBooking(bookingId);
      loadBookings();
      alert('Booking confirmed successfully!');
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Failed to confirm booking');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.cancelBooking(bookingId);
        loadBookings();
        alert('Booking cancelled successfully!');
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking');
      }
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'pending') return booking.status === 'pending';
    if (filter === 'confirmed') return booking.status === 'confirmed';
    if (filter === 'completed') return booking.status === 'completed';
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'warning', icon: Clock, text: 'Pending' },
      confirmed: { variant: 'success', icon: CheckCircle, text: 'Confirmed' },
      completed: { variant: 'info', icon: CheckCircle, text: 'Completed' },
      cancelled: { variant: 'error', icon: XCircle, text: 'Cancelled' },
      rejected: { variant: 'error', icon: XCircle, text: 'Rejected' }
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Requests</h1>
          <p className="text-gray-600">Manage your property booking requests and visit schedules</p>
        </div>

        {/* Filter Tabs */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Requests', count: bookings.length },
              { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
              { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
              { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length }
            ].map(({ key, label, count }) => (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'outline'}
                onClick={() => setFilter(key)}
                className="relative"
              >
                <Filter className="w-4 h-4 mr-2" />
                {label}
                {count > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
                    {count}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </Card>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No booking requests</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You don't have any booking requests yet." 
                  : `You don't have any ${filter} booking requests.`}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.property_title}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-3">
                        <Home className="w-4 h-4 mr-1" />
                        <span className="text-sm">{booking.booking_type === 'rental' ? 'Rental Booking' : 'Property Visit'}</span>
                        <span className="mx-2">•</span>
                        <span className="text-sm">ID: #{booking.id}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">Renter:</span>
                            <span className="ml-2">{booking.renter_name || 'Loading...'}</span>
                          </div>
                          
                          {booking.booking_type === 'rental' ? (
                            <>
                              <div className="flex items-center text-sm">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="font-medium">Move-in:</span>
                                <span className="ml-2">{formatDate(booking.start_date)}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="font-medium">End:</span>
                                <span className="ml-2">{formatDate(booking.end_date) || 'Ongoing'}</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center text-sm">
                              <Clock className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="font-medium">Visit Time:</span>
                              <span className="ml-2">{formatDate(booking.visit_time)}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          {booking.monthly_rent > 0 && (
                            <div className="flex items-center text-sm">
                              <span className="font-medium">Monthly Rent:</span>
                              <span className="ml-2 text-primary-600 font-semibold">
                                {formatCurrency(booking.monthly_rent)}
                              </span>
                            </div>
                          )}
                          
                          {booking.deposit_amount > 0 && (
                            <div className="flex items-center text-sm">
                              <span className="font-medium">Deposit:</span>
                              <span className="ml-2">{formatCurrency(booking.deposit_amount)}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center text-sm">
                            <span className="font-medium">Requested:</span>
                            <span className="ml-2">{formatDate(booking.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {booking.message && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Message:</span> {booking.message}
                          </p>
                        </div>
                      )}

                      {booking.owner_notes && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-4">
                          <p className="text-sm text-blue-700">
                            <span className="font-medium">Owner Notes:</span> {booking.owner_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/properties/${booking.property}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Property
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleConfirmBooking(booking.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingRequests;
