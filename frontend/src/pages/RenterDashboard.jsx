import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Heart, MessageSquare, CreditCard, TrendingUp, Phone, Clock, CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { bookingService } from '../services/bookingService';
import { propertyService } from '../services/propertyService';
import { formatCurrency, formatDate } from '../utils/formatters';

const RenterDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [bookingsData, favoritesData] = await Promise.all([
        bookingService.getBookings(),
        propertyService.getFavorites(),
      ]);
      
      setBookings(bookingsData.results || bookingsData);
      setFavorites(favoritesData.results || favoritesData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
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
    const icons = {
      pending: <Clock className="w-3 h-3" />,
      confirmed: <CheckCircle className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
    };
    return (
      <Badge variant={variants[status] || 'default'} className="flex items-center gap-1">
        {icons[status]}
        {status}
      </Badge>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Renter Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <Calendar className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{bookings.length}</div>
            <div className="text-gray-600 text-sm">Total Bookings</div>
          </Card>

          <Card className="text-center">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{favorites.length}</div>
            <div className="text-gray-600 text-sm">Favorites</div>
          </Card>

          <Card className="text-center">
            <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">0</div>
            <div className="text-gray-600 text-sm">Messages</div>
          </Card>

          <Card className="text-center">
            <CreditCard className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <div className="text-gray-600 text-sm">Active Rentals</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">My Bookings</h2>
                <Link to="/properties">
                  <Button variant="outline" size="sm">Browse Properties</Button>
                </Link>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No bookings yet</p>
                  <Link to="/properties">
                    <Button className="mt-4">Find Properties</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {booking.property_details?.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {booking.property_details?.city}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Type:</span> {booking.booking_type}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>{' '}
                          {formatDate(booking.start_date || booking.visit_time)}
                        </div>
                        {booking.booking_type === 'rental' && (
                          <div className="col-span-2">
                            <span className="font-medium">Amount:</span>{' '}
                            {formatCurrency(booking.total_amount)}
                          </div>
                        )}
                        {booking.booking_type === 'visit' && booking.visit_time && (
                          <div className="col-span-2">
                            <span className="font-medium">Visit Time:</span>{' '}
                            {new Date(booking.visit_time).toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Owner Contact Info */}
                      {booking.property_details?.owner && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">Property Owner</div>
                              <div className="text-sm text-gray-600">{booking.property_details.owner.full_name}</div>
                            </div>
                            {booking.property_details.owner.phone && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`tel:${booking.property_details.owner.phone}`)}
                              >
                                <Phone className="w-3 h-3 mr-1" />
                                Call
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Link to={`/properties/${booking.property}`}>
                          <Button variant="outline" size="sm">View Property</Button>
                        </Link>
                        {booking.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (confirm('Cancel this booking?')) {
                                await bookingService.cancelBooking(booking.id);
                                loadDashboardData();
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                        {booking.status === 'confirmed' && booking.booking_type === 'visit' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (confirm('Mark this visit as completed?')) {
                                await bookingService.completeBooking(booking.id);
                                loadDashboardData();
                              }
                            }}
                          >
                            Mark Completed
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Favorites */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Favorite Properties</h2>
              
              {favorites.length === 0 ? (
                <p className="text-gray-600 text-sm">No favorites yet</p>
              ) : (
                <div className="space-y-3">
                  {favorites.slice(0, 3).map((fav) => (
                    <Link
                      key={fav.id}
                      to={`/properties/${fav.property.id}`}
                      className="block border border-gray-200 rounded-lg p-3 hover:border-primary-600 transition"
                    >
                      <div className="flex gap-3">
                        {fav.property.primary_image && (
                          <img
                            src={fav.property.primary_image}
                            alt={fav.property.title}
                            className="w-16 h-16 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {fav.property.title}
                          </h4>
                          <p className="text-xs text-gray-600">{fav.property.city}</p>
                          <p className="text-sm font-semibold text-primary-600">
                            {formatCurrency(fav.property.rent_price)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {favorites.length > 3 && (
                    <Link to="/favorites">
                      <Button variant="outline" size="sm" className="w-full">
                        View All ({favorites.length})
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link to="/properties">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Browse Properties
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Market Trends
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    Update Preferences
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenterDashboard;
