import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  MapPin, Bed, Bath, Square, Heart, Share2, Flag, 
  CheckCircle, Wifi, Car, Wind, Dumbbell, Star, Calendar,
  Phone, MessageCircle, Clock, Users, Send, AlertTriangle, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import ContactModal from '../components/ContactModal';
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
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  useEffect(() => {
    loadProperty();
    loadReviews();
    generateTimeSlots();
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

  const generateTimeSlots = () => {
    const slots = [];
    const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      times.forEach(time => {
        slots.push({
          date: dateStr,
          time: time,
          datetime: `${dateStr}T${time}:00`,
          display: `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${time}`
        });
      });
    }
    
    setAvailableTimeSlots(slots);
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

  const [isBooking, setIsBooking] = useState(false);

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }

    setIsBooking(true);
    const loadingToast = toast.loading('Processing your request...');

    try {
      const bookingPayload = {
        property: id,
        booking_type: bookingType,
        ...bookingData,
      };
      
      // Add end_date for rentals (typically 12 months)
      if (bookingType === 'rental') {
        if (!bookingData.start_date) {
          throw new Error('Please select a move-in date');
        }
        const startDate = new Date(bookingData.start_date);
        startDate.setMonth(startDate.getMonth() + 12);
        bookingPayload.end_date = startDate.toISOString().split('T')[0];
        bookingPayload.monthly_rent = property.rent_price;
        bookingPayload.deposit_amount = property.rent_price * 0.5;
        bookingPayload.total_amount = property.rent_price * 0.5;
      } else if (bookingType === 'visit' && !bookingData.visit_time) {
        throw new Error('Please select a visit time');
      }
      
      await bookingService.createBooking(bookingPayload);
      
      toast.update(loadingToast, {
        render: bookingType === 'rental' 
          ? `Booking request sent! ${formatCurrency(property.rent_price * 0.5)} deposit required.` 
          : 'Visit request sent! The owner will contact you soon.',
        type: 'success',
        isLoading: false,
        autoClose: 5000
      });
      
      setShowBookingModal(false);
      setBookingData({
        start_date: '',
        visit_time: '',
        message: ''
      });
      
      navigate('/renter/bookings');
    } catch (error) {
      console.error('Booking error:', error);
      toast.update(loadingToast, {
        render: error.response?.data?.message || error.message || 'Failed to process booking. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 4000
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleContactOwner = async (method = 'message') => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }

    const loadingToast = toast.loading('Processing...');

    try {
      if (method === 'call') {
        if (!property.owner.phone) {
          throw new Error('Phone number not available for this property');
        }
        window.open(`tel:${property.owner.phone}`);
        toast.update(loadingToast, {
          render: 'Opening phone app...',
          type: 'info',
          isLoading: false,
          autoClose: 2000
        });
        return;
      }

      if (method === 'whatsapp') {
        if (!property.owner.phone) {
          throw new Error('Phone number not available for WhatsApp');
        }
        const message = encodeURIComponent(
          `Hi, I'm interested in your property: ${property.title}\n\n` +
          `Property: ${property.title}\n` +
          `Price: ${formatCurrency(property.rent_price)}/month\n` +
          `Location: ${property.address}, ${property.area}`
        );
        window.open(`https://wa.me/${property.owner.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
        toast.update(loadingToast, {
          render: 'Opening WhatsApp...',
          type: 'info',
          isLoading: false,
          autoClose: 2000
        });
        return;
      }

      if (method === 'telegram') {
        if (property.owner.telegram_username) {
          window.open(`https://t.me/${property.owner.telegram_username.replace('@', '')}`, '_blank');
          toast.update(loadingToast, {
            render: 'Opening Telegram...',
            type: 'info',
            isLoading: false,
            autoClose: 2000
          });
        } else {
          toast.update(loadingToast, {
            render: 'Telegram username not available',
            type: 'warning',
            isLoading: false,
            autoClose: 3000
          });
          setShowContactModal(true);
        }
        return;
      }

      // Default to showing contact modal
      setShowContactModal(true);
      toast.dismiss(loadingToast);
    } catch (error) {
      console.error('Contact error:', error);
      toast.update(loadingToast, {
        render: error.message || 'Failed to initiate contact. Please try another method.',
        type: 'error',
        isLoading: false,
        autoClose: 4000
      });
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
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property Type:</span>
                      <span className="font-medium capitalize">{property.property_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bedrooms:</span>
                      <span className="font-medium">{property.bedrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bathrooms:</span>
                      <span className="font-medium">{property.bathrooms}</span>
                    </div>
                    {property.area_sqm && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Area:</span>
                        <span className="font-medium">{property.area_sqm} m²</span>
                      </div>
                    )}
                    {property.floor_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Floor:</span>
                        <span className="font-medium">{property.floor_number}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Furnished:</span>
                      <span className="font-medium">{property.is_furnished ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pets Allowed:</span>
                      <span className="font-medium">{property.pets_allowed ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Availability:</span>
                      <span className={`font-medium ${property.availability_status === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                        {property.availability_status === 'available' ? 'Available Now' : 'Not Available'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Pricing</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Rent:</span>
                      <span className="font-medium text-lg">{formatCurrency(property.rent_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Security Deposit:</span>
                      <span className="font-medium">{formatCurrency(property.deposit || property.rent_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Deposit (50%):</span>
                      <span className="font-medium text-primary-600">{formatCurrency(property.rent_price * 0.5)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>Total to Book Now:</span>
                      <span className="text-primary-600">{formatCurrency(property.rent_price * 0.5)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
              </div>
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
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {formatCurrency(property.rent_price * 0.5)}
                  </div>
                  <div className="text-sm text-gray-600">Required deposit to book now</div>
                  <div className="text-xs text-gray-500 mt-1">50% of monthly rent</div>
                </div>

                <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">Book Now & Secure This Property</div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold text-primary-600">
                      {formatCurrency(property.rent_price * 0.5)}
                    </span>
                    <span className="text-sm text-gray-500">deposit required</span>
                  </div>
                  <Button
                    className="w-full bg-primary-600 hover:bg-primary-700"
                    onClick={() => {
                      setBookingType('rental');
                      setShowBookingModal(true);
                    }}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Now
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 flex flex-col items-center justify-center h-full py-2"
                      onClick={() => handleContactOwner('call')}
                      disabled={!property.owner.phone}
                      title={!property.owner.phone ? 'Phone number not available' : 'Call the owner'}
                    >
                      <Phone className="w-5 h-5 mb-1" />
                      <span className="text-xs">Call Now</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 flex flex-col items-center justify-center h-full py-2"
                      onClick={() => handleContactOwner('whatsapp')}
                      disabled={!property.owner.phone}
                      title={!property.owner.phone ? 'Phone number not available' : 'Message on WhatsApp'}
                    >
                      <MessageCircle className="w-5 h-5 mb-1" />
                      <span className="text-xs">WhatsApp</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 flex flex-col items-center justify-center h-full py-2"
                      onClick={() => handleContactOwner('telegram')}
                      disabled={!property.owner.telegram_username}
                      title={!property.owner.telegram_username ? 'Telegram not available' : 'Message on Telegram'}
                    >
                      <Send className="w-5 h-5 mb-1" />
                      <span className="text-xs">Telegram</span>
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setBookingType('visit');
                      setShowBookingModal(true);
                    }}
                  >
                    <Calendar className="w-4 h-4 mr-1.5" />
                    Schedule Visit
                  </Button>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  <p>Contact owner for more details or special requests</p>
                  <p className="mt-1">Response time: {property.owner.response_time || 'Usually within 24 hours'}</p>
                </div>
              </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Monthly Rent:</span>
                    <span className="font-semibold">{formatCurrency(property.rent_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Deposit:</span>
                    <span className="font-semibold">{formatCurrency(property.deposit || property.rent_price)}</span>
                  </div>
                  <div className="flex justify-between text-primary-600">
                    <span>Booking Deposit (50%):</span>
                    <span className="font-semibold">{formatCurrency(property.rent_price * 0.5)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Due Now:</span>
                    <span className="text-primary-600">{formatCurrency(property.rent_price * 0.5)}</span>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-lg">
                  <div className="text-sm text-amber-800">
                    <strong>Booking Policy:</strong> 50% deposit required to secure this property. This amount will be applied to your first month's rent.
                  </div>
                </div>
              </div>
            </Card>

            {/* Owner Info & Contact */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Property Owner & Contact</h3>
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
                    <Badge variant="success" className="text-xs">Verified Owner</Badge>
                  )}
                  <div className="text-sm text-gray-600">
                    {property.owner.response_time ? `Avg response: ${property.owner.response_time}` : 'Usually responds quickly'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-gray-700">
                      <Phone className="w-4 h-4 mr-2" />
                      <span className="font-medium">{property.owner.phone || '+855 123 456 789'}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`tel:${property.owner.phone || '+855123456789'}`)}
                    >
                      Call Now
                    </Button>
                  </div>
                  {property.owner.email && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {property.owner.email}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleContactOwner}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowBookingModal(true)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Visit
                  </Button>
                </div>
                
                <div className="text-xs text-gray-500 text-center">
                  Contact information is verified and available 24/7
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">
              {bookingType === 'rental' ? `Book Property - ${formatCurrency(property.rent_price * 0.5)} Deposit` : 'Schedule a Visit'}
            </h3>
            
            {bookingType === 'rental' && (
              <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                <div className="text-sm text-primary-800">
                  <strong>Booking Summary:</strong><br/>
                  • Deposit required: {formatCurrency(property.rent_price * 0.5)} (50% of monthly rent)<br/>
                  • This amount secures your property and applies to first month's rent<br/>
                  • Remaining balance due upon move-in
                </div>
              </div>
            )}
            
            <form onSubmit={handleBooking} className="space-y-4">
              {bookingType === 'rental' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Move-in Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={bookingData.start_date}
                    onChange={(e) => setBookingData({ ...bookingData, start_date: e.target.value })}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Visit Time
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
                    {availableTimeSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBookingData({ ...bookingData, visit_time: slot.datetime })}
                        className={`w-full px-4 py-2 text-left border-b border-gray-100 hover:bg-gray-50 transition ${
                          bookingData.visit_time === slot.datetime ? 'bg-primary-50 text-primary-600 font-medium' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {slot.display}
                        </div>
                      </button>
                    ))}
                  </div>
                  {bookingData.visit_time && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-green-700 text-sm">
                      Selected: {new Date(bookingData.visit_time).toLocaleString()}
                    </div>
                  )}
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
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isBooking}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : bookingType === 'rental' ? (
                    `Pay ${formatCurrency(property.rent_price * 0.5)} & Book`
                  ) : (
                    'Schedule Visit'
                  )}
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

      {/* Contact Modal */}
      {showContactModal && (
        <ContactModal
          property={property}
          onClose={() => setShowContactModal(false)}
          user={user}
        />
      )}
    </div>
  );
};

export default PropertyDetail;
