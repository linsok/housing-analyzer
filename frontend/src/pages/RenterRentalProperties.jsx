import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, History, Eye, MapPin, Calendar, DollarSign, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { bookingService } from '../services/bookingService';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

const RenterRentalProperties = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'history'

  useEffect(() => {
    loadRentalProperties();
  }, []);

  const loadRentalProperties = async () => {
    try {
      const bookingsData = await bookingService.getBookings();
      const processedBookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData?.results || []);
      
      // Filter only rental bookings
      const rentalBookings = processedBookings.filter(b => b.booking_type === 'rental');
      
      // Debug: Log booking data structure
      console.log('=== RENTAL PROPERTIES DEBUG ===');
      console.log('Sample booking data:', rentalBookings.slice(0, 2));
      
      setBookings(rentalBookings);
    } catch (error) {
      console.error('Error loading rental properties:', error);
      setBookings([]);
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
      checked_out: 'info',
    };
    const icons = {
      pending: <Clock className="w-3 h-3" />,
      confirmed: <CheckCircle className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      cancelled: <X className="w-3 h-3" />,
      rejected: <X className="w-3 h-3" />,
      checked_out: <CheckCircle className="w-3 h-3" />,
    };
    return (
      <Badge variant={variants[status] || 'default'} className="flex items-center gap-1">
        {icons[status]}
        {status}
      </Badge>
    );
  };

  const handleHideProperty = async (bookingId) => {
    if (confirm('Are you sure you want to hide this rental from your history?')) {
      try {
        // This would call an API to hide the booking
        console.log('Hide rental:', bookingId);
        // For now, just remove from local state
        setBookings(bookings.filter(b => b.id !== bookingId));
      } catch (error) {
        console.error('Error hiding rental:', error);
      }
    }
  };

  // Separate current and historical rentals
  const currentRentals = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
  const historicalRentals = bookings.filter(b => b.status !== 'confirmed' && b.status !== 'completed');

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Rental Properties</h1>
            <p className="text-gray-600 mt-2">View your current rentals and rental history</p>
          </div>
          <Link to="/renter/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <Home className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{currentRentals.length}</div>
            <div className="text-gray-600 text-sm">Current Rentals</div>
          </Card>

          <Card className="text-center">
            <History className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{historicalRentals.length}</div>
            <div className="text-gray-600 text-sm">Past Rentals</div>
          </Card>

          
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('current')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'current'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Home className="w-4 h-4 inline mr-2" />
              Current Rentals ({currentRentals.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <History className="w-4 h-4 inline mr-2" />
              Rental History ({historicalRentals.length})
            </button>
          </nav>
        </div>

        {/* Current Rentals */}
        {activeTab === 'current' && (
          <div className="space-y-6">
            {currentRentals.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Current Rentals</h3>
                  <p className="text-gray-600 mb-4">You don't have any active rental properties</p>
                  <Link to="/properties">
                    <Button>
                      <Home className="w-4 h-4 mr-2" />
                      Browse Properties
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentRentals.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                    {booking.property_details?.primary_image && (
                      <img
                        src={booking.property_details.primary_image}
                        alt={booking.property_details.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {booking.property_details?.title}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {booking.property_details?.city}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Monthly Rent:</span>
                          <span className="font-semibold text-primary-600">
                            {formatCurrency(
                              booking.property_details?.rent_price || 
                              booking.monthly_rent || 
                              booking.rent_price || 
                              booking.total_amount || 
                              0
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Move-in Date:</span>
                          <span className="text-sm">
                            {formatDate(booking.start_date)}
                          </span>
                        </div>
                        {booking.end_date && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">End Date:</span>
                            <span className="text-sm">
                              {formatDate(booking.end_date)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Occupants:</span>
                          <span className="text-sm">
                            {booking.member_count || 1} {booking.member_count > 1 ? 'people' : 'person'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/properties/${booking.property}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-3 h-3 mr-1" />
                            View Property
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rental History */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {historicalRentals.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <History className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Rental History</h3>
                  <p className="text-gray-600">Your rental history will appear here</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historicalRentals.map((booking) => (
                  <Card key={booking.id} className="opacity-75">
                    {booking.property_details?.primary_image && (
                      <img
                        src={booking.property_details.primary_image}
                        alt={booking.property_details.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {booking.property_details?.title}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {booking.property_details?.city}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(booking.status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleHideProperty(booking.id)}
                            className="text-xs"
                          >
                            Hide
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Monthly Rent:</span>
                          <span className="font-semibold text-gray-600">
                            {formatCurrency(
                              booking.property_details?.rent_price || 
                              booking.monthly_rent || 
                              booking.rent_price || 
                              booking.total_amount || 
                              0
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Period:</span>
                          <span className="text-sm">
                            {formatDate(booking.start_date)} - {booking.end_date ? formatDate(booking.end_date) : 'Ongoing'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Booked:</span>
                          <span className="text-sm">
                            {formatDate(booking.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/properties/${booking.property}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-3 h-3 mr-1" />
                            View Property
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RenterRentalProperties;
