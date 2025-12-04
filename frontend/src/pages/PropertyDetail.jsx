import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Bed, Bath, Square, Heart, Share2, Flag, 
  CheckCircle, Wifi, Car, Wind, Dumbbell, Star, Calendar 
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import { propertyService } from '../services/propertyService';
import { bookingService } from '../services/bookingService';
import { reviewService } from '../services/reviewService';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency, formatDate } from '../utils/formatters';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingType, setBookingType] = useState('rental');
  const [bookingData, setBookingData] = useState({
    start_date: '',
    visit_time: '',
    message: '',
  });

  useEffect(() => {
    loadProperty();
    loadReviews();
  }, [id]);

  const loadProperty = async () => {
    try {
      const data = await propertyService.getProperty(id);
      setProperty(data);
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await reviewService.getReviews(id);
      setReviews(data.results || data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Please login to save favorites');
      return;
    }

    try {
      await propertyService.toggleFavorite(id);
      loadProperty();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please login to book');
      navigate('/login');
      return;
    }

    try {
      await bookingService.createBooking({
        property: id,
        booking_type: bookingType,
        ...bookingData,
      });
      
      alert('Booking request sent successfully!');
      setShowBookingModal(false);
      navigate('/renter/dashboard');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
    }
  };

  const facilityIcons = {
    wifi: Wifi,
    parking: Car,
    ac: Wind,
    gym: Dumbbell,
  };

  if (loading) return <Loading />;
  if (!property) return <div className="text-center py-12">Property not found</div>;

  const images = property.images || [];
  const currentImage = images[selectedImage]?.image || property.primary_image;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Image Gallery */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="relative h-96 bg-gray-200">
            {currentImage ? (
              <img
                src={currentImage}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleToggleFavorite}
                className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <Heart
                  className={`w-6 h-6 ${property.is_favorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </button>
              <button className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100">
                <Share2 className="w-6 h-6 text-gray-600" />
              </button>
              <button className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100">
                <Flag className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 ${
                    selectedImage === idx ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img src={img.image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Location */}
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-1" />
                    <span>{property.address}, {property.area}, {property.city}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {property.is_verified && (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </Badge>
                  )}
                  {property.owner.is_verified && (
                    <Badge variant="info">Verified Owner</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 text-gray-700 mb-4">
                <div className="flex items-center">
                  <Bed className="w-5 h-5 mr-2" />
                  <span>{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center">
                  <Bath className="w-5 h-5 mr-2" />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
                {property.area_sqm && (
                  <div className="flex items-center">
                    <Square className="w-5 h-5 mr-2" />
                    <span>{property.area_sqm} m²</span>
                  </div>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary-600">
                  {formatCurrency(property.rent_price, property.currency)}
                </span>
                <span className="text-gray-600">/month</span>
              </div>
            </Card>

            {/* Description */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
            </Card>

            {/* Features & Amenities */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Features & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.is_furnished && (
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    <span>Furnished</span>
                  </div>
                )}
                {property.pets_allowed && (
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    <span>Pets Allowed</span>
                  </div>
                )}
                {property.facilities?.map((facility, idx) => {
                  const Icon = facilityIcons[facility.toLowerCase()] || CheckCircle;
                  return (
                    <div key={idx} className="flex items-center text-gray-700">
                      <Icon className="w-5 h-5 mr-2 text-green-600" />
                      <span className="capitalize">{facility}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Reviews */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              {reviews.length === 0 ? (
                <p className="text-gray-600">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold">{review.reviewer_name}</div>
                          <div className="flex items-center text-yellow-500">
                            {[...Array(review.overall_rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      {review.title && <h4 className="font-medium mb-1">{review.title}</h4>}
                      <p className="text-gray-700">{review.comment}</p>
                      {review.is_verified && (
                        <Badge variant="success" className="mt-2">Verified Renter</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Book This Property</h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setBookingType('rental')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                      bookingType === 'rental'
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-gray-300'
                    }`}
                  >
                    Rent
                  </button>
                  <button
                    onClick={() => setBookingType('visit')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                      bookingType === 'visit'
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-gray-300'
                    }`}
                  >
                    Visit
                  </button>
                </div>

                <Button
                  className="w-full"
                  onClick={() => setShowBookingModal(true)}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  {bookingType === 'rental' ? 'Request to Rent' : 'Schedule Visit'}
                </Button>

                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Monthly Rent:</span>
                    <span className="font-semibold">{formatCurrency(property.rent_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deposit:</span>
                    <span className="font-semibold">{formatCurrency(property.deposit)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(parseFloat(property.rent_price) + parseFloat(property.deposit))}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Owner Info */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Property Owner</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {property.owner.profile_picture ? (
                    <img
                      src={property.owner.profile_picture}
                      alt={property.owner.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-semibold text-gray-600">
                      {property.owner.full_name?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-semibold">{property.owner.full_name}</div>
                  {property.owner.is_verified && (
                    <Badge variant="success" className="text-xs">Verified</Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Contact Owner
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">
              {bookingType === 'rental' ? 'Request to Rent' : 'Schedule a Visit'}
            </h3>
            
            <form onSubmit={handleBooking} className="space-y-4">
              {bookingType === 'rental' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Move-in Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={bookingData.start_date}
                    onChange={(e) => setBookingData({ ...bookingData, start_date: e.target.value })}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visit Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={bookingData.visit_time}
                    onChange={(e) => setBookingData({ ...bookingData, visit_time: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={bookingData.message}
                  onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                  placeholder="Any special requests or questions..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Submit Request
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
