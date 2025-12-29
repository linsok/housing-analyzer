import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Bed, Bath, Square, Heart, CheckCircle,
  Wifi, Car, Wind, Dumbbell, Star, Calendar,
  Phone, MessageCircle, Clock, Send, Loader2, Home
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import ContactModal from '../components/ContactModal';
import ImageViewer from '../components/ImageViewer';

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
  const [showImageViewer, setShowImageViewer] = useState(false);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingType, setBookingType] = useState('rental');
  const [isBooking, setIsBooking] = useState(false);

  const [bookingData, setBookingData] = useState({
    start_date: '',
    visit_time: '',
    message: '',
  });

  const [showContactModal, setShowContactModal] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadProperty();
    loadReviews();
    generateTimeSlots();
  }, [id]);

  const loadProperty = async () => {
    try {
      const data = await propertyService.getProperty(id);
      setProperty(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await reviewService.getReviews(id);
      setReviews(data.results || data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= TIME SLOTS ================= */

  const generateTimeSlots = () => {
    const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    const slots = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      times.forEach(time => {
        slots.push({
          datetime: `${dateStr}T${time}:00`,
          display: `${date.toDateString()} at ${time}`
        });
      });
    }

    setAvailableTimeSlots(slots);
  };

  /* ================= ACTIONS ================= */

  const handleToggleFavorite = async () => {
    try {
      await propertyService.toggleFavorite(id);
      setProperty(prev => ({
        ...prev,
        is_favorited: !prev.is_favorited,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsBooking(true);
    const loadingToast = toast.loading('Processing booking...');

    try {
      const payload = {
        property: id,
        booking_type: bookingType,
        ...bookingData,
      };

      if (bookingType === 'rental') {
        if (!bookingData.start_date) throw new Error('Select move-in date');
        const start = new Date(bookingData.start_date);
        start.setMonth(start.getMonth() + 12);
        payload.end_date = start.toISOString().split('T')[0];
        payload.deposit_amount = property.rent_price * 0.5;
      }

      if (bookingType === 'visit' && !bookingData.visit_time) {
        throw new Error('Select visit time');
      }

      await bookingService.createBooking(payload);

      toast.update(loadingToast, {
        render: 'Booking request sent successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 4000,
      });

      setShowBookingModal(false);
      setBookingData({ start_date: '', visit_time: '', message: '' });
      navigate('/renter/bookings');
    } catch (err) {
      toast.update(loadingToast, {
        render: err.message || 'Booking failed',
        type: 'error',
        isLoading: false,
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleContactOwner = (method = 'message') => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (method === 'call' && property.owner?.phone) {
      window.open(`tel:${property.owner.phone}`);
      return;
    }

    if (method === 'whatsapp' && property.owner?.phone) {
      window.open(`https://wa.me/${property.owner.phone.replace(/\D/g, '')}`);
      return;
    }

    setShowContactModal(true);
  };

  /* ================= IMAGES ================= */

  const images = property?.images || [];
  const allImages = [];

  if (property?.primary_image) {
    allImages.push(property.primary_image);
  }

  images.forEach(img => {
    if (img.image && img.image !== property.primary_image) {
      allImages.push(img.image);
    }
  });

  const imageSources = allImages.filter(Boolean);

  /* ================= EARLY RETURN ================= */

  if (loading) return <Loading />;
  if (!property) return <div className="text-center py-10">Property not found</div>;

  /* ================= ICON MAP ================= */

  const facilityIcons = {
    wifi: Wifi,
    parking: Car,
    ac: Wind,
    gym: Dumbbell,
  };

  /* ================= JSX ================= */

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* IMAGE GALLERY - AIRBNB STYLE HERO + GRID */}
      <div className="mb-8">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[600px]">
          {/* Hero Image - Takes 2x2 space */}
          <div 
            className="col-span-2 row-span-2 relative group cursor-pointer"
            onClick={() => {
              setSelectedImage(0);
              setShowImageViewer(true);
            }}
          >
            <img
              src={imageSources[0] || '/placeholder-property.jpg'}
              alt="Property main image"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white rounded-full p-4 shadow-2xl transform group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
            {imageSources.length > 1 && (
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-2 rounded-full text-sm font-medium shadow-lg">
                +{imageSources.length - 1} photos
              </div>
            )}
          </div>
          
          {/* Supporting Images */}
          {imageSources.slice(1, 5).map((img, i) => (
            <div
              key={i + 1}
              className="relative group cursor-pointer overflow-hidden"
              onClick={() => {
                setSelectedImage(i + 1);
                setShowImageViewer(true);
              }}
            >
              <img
                src={img}
                alt={`Property image ${i + 2}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white rounded-full p-2 shadow-lg">
                    <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* More Photos Overlay */}
          {imageSources.length > 5 && (
            <div 
              className="relative group cursor-pointer overflow-hidden bg-gray-200"
              onClick={() => {
                setSelectedImage(0);
                setShowImageViewer(true);
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-700 mb-2">+{imageSources.length - 5}</div>
                  <div className="text-sm text-gray-600 font-medium">More photos</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white rounded-full p-3 shadow-lg">
                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* View All Photos Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setSelectedImage(0);
              setShowImageViewer(true);
            }}
            className="inline-flex items-center px-8 py-4 bg-white border-2 border-gray-300 text-gray-800 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            View all {imageSources.length} photos
          </button>
        </div>
      </div>

      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
      <div className="flex items-center text-gray-600 mb-4">
        <MapPin className="w-4 h-4 mr-1" />
        {property.city}, {property.area}
      </div>

      {/* PRICE */}
      <div className="text-3xl font-bold text-primary-600 mb-6">
        {formatCurrency(property.rent_price)} / month
      </div>

      {/* BOOKING BUTTON */}
      <Button onClick={() => setShowBookingModal(true)}>
        <Calendar className="w-4 h-4 mr-2" />
        Book Now
      </Button>

      {/* IMAGE VIEWER */}
      {showImageViewer && (
        <ImageViewer
          isOpen
          images={imageSources}
          currentIndex={selectedImage}
          onClose={() => setShowImageViewer(false)}
          onImageChange={setSelectedImage}
        />
      )}

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <form onSubmit={handleBooking} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Book Property</h2>

            {/* Booking Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Booking Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBookingType('rental')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    bookingType === 'rental'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Home className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Reserve Room</div>
                  <div className="text-xs text-gray-500">Monthly rental</div>
                </button>
                <button
                  type="button"
                  onClick={() => setBookingType('visit')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    bookingType === 'visit'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Calendar className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Book Visit</div>
                  <div className="text-xs text-gray-500">Schedule tour</div>
                </button>
              </div>
            </div>

            {/* Rental Booking Fields */}
            {bookingType === 'rental' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Move-in Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={bookingData.start_date}
                  onChange={e => setBookingData({ ...bookingData, start_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                {bookingData.start_date && (
                  <div className="mt-2 text-sm text-gray-600">
                    <div>Monthly Rent: {formatCurrency(property.rent_price)}</div>
                    <div>Security Deposit (50%): {formatCurrency(property.rent_price * 0.5)}</div>
                    <div className="font-semibold mt-1">
                      Total Due: {formatCurrency(property.rent_price * 1.5)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Visit Booking Fields */}
            {bookingType === 'visit' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Visit Time
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {availableTimeSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setBookingData({ ...bookingData, visit_time: slot.datetime })}
                      className={`p-2 text-xs border rounded-lg transition-colors ${
                        bookingData.visit_time === slot.datetime
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {slot.display}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Message (Optional)
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={bookingType === 'rental' 
                  ? "Any special requirements or questions about the property..." 
                  : "Let the owner know what you'd like to see during the visit..."
                }
                value={bookingData.message}
                onChange={e => setBookingData({ ...bookingData, message: e.target.value })}
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingData({ start_date: '', visit_time: '', message: '' });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isBooking || (bookingType === 'rental' && !bookingData.start_date) || (bookingType === 'visit' && !bookingData.visit_time)}
                className="flex-1"
              >
                {isBooking ? <Loader2 className="animate-spin w-4 h-4" /> : 
                 bookingType === 'rental' ? 'Reserve Room' : 'Book Visit'
                }
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* CONTACT MODAL */}
      {showContactModal && (
        <ContactModal
          property={property}
          user={user}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
};

export default PropertyDetail;
