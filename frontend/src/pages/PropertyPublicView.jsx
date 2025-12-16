import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, Heart, MapPin, Bed, Bath, Ruler, Users, Home, 
  Building, Hotel, Castle, X, Calendar, Clock, MessageCircle, 
  Phone, Send, Loader2, CreditCard, CalendarCheck, UserPlus
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { bookingService } from '../services/bookingService';
import { useAuthStore } from '../store/useAuthStore';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PropertyPublicView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredDate: '',
    preferredTime: '',
    memberCount: '',
    notes: ''
  });
  const [showBookNowModal, setShowBookNowModal] = useState(false);
  const [availableTimeSlots] = useState([
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        console.log('Fetching property with ID:', id);
        const data = await propertyService.getProperty(id);
        console.log('Property data received:', data);
        // Debug: Check if qr_code exists in the response
        console.log('QR Code in response:', data.qr_code);
        // Debug: Check images array for QR code
        console.log('Property images:', data.images);
        setProperty(data);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(`Failed to load property details: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    } else {
      setError('No property ID provided');
      setLoading(false);
    }
  }, [id]);

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    setShowContactModal(true);
  };

  

  // Format price helper function
  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0.00';
    const num = parseFloat(price);
    return isNaN(num) ? '0.00' : num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleSaveProperty = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    
    setIsSaving(true);
    try {
      // Assuming you have a method to toggle favorite status
      await propertyService.toggleFavorite(property.id);
      toast.success(property.is_favorited ? 'Removed from saved properties' : 'Saved to your properties');
      // Refresh property data to update the favorite status
      const updatedProperty = await propertyService.getProperty(id);
      setProperty(updatedProperty);
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Failed to save property. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBookViewing = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}/book` } });
      return;
    }
    setShowBookingModal(true);
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}/book-now` } });
      return;
    }
    setShowBookNowModal(true);
  };

  const handleSubmitBookNow = async (e) => {
    e.preventDefault();
    if (!formData.preferredDate || !formData.phone || !formData.memberCount) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Ensure rent_price is a valid number
    const monthlyPrice = parseFloat(property.rent_price);
    if (isNaN(monthlyPrice) || monthlyPrice <= 0) {
      throw new Error('Invalid property price. Please contact support.');
    }

    // Calculate deposit (50% of the price)
    const depositAmount = (monthlyPrice * 0.5).toFixed(2);
    
    // Save booking data to sessionStorage for payment page
    const bookingData = {
      bookingId: null, // Will be set after creating booking
      propertyId: property.id,
      preferredDate: formData.preferredDate,
      phone: formData.phone,
      memberCount: formData.memberCount,
      notes: formData.notes,
      depositAmount: parseFloat(depositAmount),
      monthlyRent: monthlyPrice,
      bookingType: 'rental'
    };

    // Save to sessionStorage and redirect to payment page
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    navigate(`/properties/${property.id}/payment`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Send message to property owner
      await bookingService.sendPropertyMessage(
        property.id,
        `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage: ${formData.message}`
      );
      
      // Send email notification (if your backend supports it)
      await bookingService.sendMessage({
        property: property.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        type: 'contact_owner'
      });
      
      toast.success('Your message has been sent to the property owner!');
      setShowContactModal(false);
      setFormData(prev => ({
        ...prev,
        name: '',
        email: '',
        phone: '',
        message: ''
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!formData.preferredDate || !formData.preferredTime) {
      toast.error('Please select both date and time for the viewing');
      return;
    }
    
    const visitTime = `${formData.preferredDate}T${formData.preferredTime}:00`;
    
    setIsSubmitting(true);
    
    try {
      // First check availability
      const availability = await bookingService.checkAvailability(
        property.id, 
        formData.preferredDate
      );
      
      if (!availability.available) {
        toast.error('The selected time slot is no longer available. Please choose another time.');
        return;
      }
      
      // Schedule the viewing
      await bookingService.scheduleViewing(property.id, {
        visit_time: visitTime,
        notes: formData.message || 'I would like to book a viewing for this property.',
        contact_info: {
          name: formData.name || '',
          email: formData.email || '',
          phone: formData.phone || ''
        }
      });
      
      // Send confirmation email (if your backend supports it)
      await bookingService.sendMessage({
        property: property.id,
        visit_time: visitTime,
        message: formData.message || 'Viewing request',
        type: 'viewing_request'
      });
      
      toast.success('Viewing booked successfully! The owner will contact you soon to confirm.');
      setShowBookingModal(false);
      setFormData(prev => ({
        ...prev,
        preferredDate: '',
        preferredTime: '',
        message: ''
      }));
    } catch (error) {
      console.error('Error booking viewing:', error);
      const errorMessage = error.response?.data?.message || 'Failed to book viewing. Please try again.';
      toast.error(errorMessage);
      
      // If the error is about time slot, refresh available slots
      if (error.response?.status === 409) {
        // You might want to refresh the page or available slots here
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const getPropertyTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'apartment':
        return <Building className="w-5 h-5 mr-2" />;
      case 'house':
        return <Home className="w-5 h-5 mr-2" />;
      case 'villa':
        return <Castle className="w-5 h-5 mr-2" />;
      case 'hotel':
        return <Hotel className="w-5 h-5 mr-2" />;
      default:
        return <Home className="w-5 h-5 mr-2" />;
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
  if (!property) return <div className="container mx-auto px-4 py-8">Property not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Image Gallery */}
        <div className="relative">
          {property.images && property.images.length > 0 ? (
            <div className="relative h-96 overflow-hidden">
              <img
                src={property.images[currentImageIndex].image}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No images available</span>
            </div>
          )}
          
          {/* Image Navigation */}
          {property.images && property.images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full ${currentImageIndex === index ? 'bg-white' : 'bg-white/50'}`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
              <div className="flex items-center text-gray-600 mt-2">
                <MapPin className="w-5 h-5 mr-1" />
                <span>{property.address}, {property.city}</span>
              </div>
              <div className="flex items-center mt-2">
                {getPropertyTypeIcon(property.property_type)}
                <span className="capitalize">{property.property_type}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">${property.price_per_month}/month</div>
              <div className="text-sm text-gray-500">${(property.price_per_month / 30).toFixed(2)}/night</div>
            </div>
          </div>

          {/* Amenities */}
          <div className="mt-6 border-t border-b border-gray-200 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <Bed className="w-5 h-5 mr-2 text-gray-500" />
                <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
              </div>
              <div className="flex items-center">
                <Bath className="w-5 h-5 mr-2 text-gray-500" />
                <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
              </div>
              <div className="flex items-center">
                <Ruler className="w-5 h-5 mr-2 text-gray-500" />
                <span>{property.area_sqft} sq.ft</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-gray-500" />
                <span>Max {property.max_occupants} {property.max_occupants === 1 ? 'person' : 'people'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">About this property</h2>
            <p className="text-gray-700">{property.description}</p>
          </div>

          {/* Amenities List */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span>
                    <span className="capitalize">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button 
                variant="primary" 
                className="w-full sm:w-auto"
                onClick={handleBookNow}
              >
                <CalendarCheck className="w-5 h-5 mr-2" />
                Book Now
              </Button>
              {/* Book Now Modal */}
{showBookNowModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
      <button 
        onClick={() => setShowBookNowModal(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <X className="w-6 h-6" />
      </button>
      
      <h2 className="text-2xl font-bold mb-4">Book This Property</h2>
      <p className="text-gray-600 mb-6">Please fill in the details to book this property. A 50% deposit is required.</p>
      
      <form onSubmit={handleSubmitBookNow} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-1">
              Move-in Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="preferredDate"
              name="preferredDate"
              min={today}
              value={formData.preferredDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="memberCount" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Occupants <span className="text-red-500">*</span>
            </label>
            <select
              id="memberCount"
              name="memberCount"
              value={formData.memberCount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select number of people</option>
              {[1, 2, 3, 4, 5, '6+'].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Any special requests or additional information..."
            />
          </div>
          
       <div className="md:col-span-2 bg-gray-50 p-4 rounded-md">
    <h3 className="font-medium text-gray-900 mb-2">Pricing Summary</h3>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Monthly Rent:</span>
        <span>${formatPrice(property?.rent_price)}/month</span>
      </div>
      <div className="flex justify-between font-medium">
        <span>Required Deposit (50%):</span>
        <span>${formatPrice((property?.rent_price || 0) * 0.5)}</span>
      </div>
    </div>
  </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setShowBookNowModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Deposit & Book
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={handleBookViewing}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Viewing
              </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={handleContactOwner}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact Owner
            </Button>
            <Button 
              variant="ghost" 
              className={`w-full sm:w-auto ${property?.is_favorited ? 'text-red-500' : ''}`}
              onClick={handleSaveProperty}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Heart 
                  className={`w-5 h-5 mr-2 ${property?.is_favorited ? 'fill-current' : ''}`} 
                />
              )}
              {property?.is_favorited ? 'Saved' : 'Save'}
            </Button>
            </div>
          </div>

          {/* Contact Modal */}
          {/* Contact Modal */}
{showContactModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
      <button 
        onClick={() => setShowContactModal(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <X className="w-6 h-6" />
      </button>
      
      <h2 className="text-2xl font-bold mb-4">Contact Property Owner</h2>
      <p className="text-gray-600 mb-6">Send a message to the property owner about this listing.</p>
      
      <form onSubmit={handleSubmitContact} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows="4"
            value={formData.message}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="I'm interested in this property. Please provide more details."
            required
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => setShowContactModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

          {/* Booking Modal */}
          {showBookingModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                <button 
                  onClick={() => setShowBookingModal(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <h2 className="text-2xl font-bold mb-2">Book a Viewing</h2>
                <p className="text-gray-600 mb-6">Schedule a visit to view this property.</p>
                
                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  <div>
                    <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      id="preferredDate"
                      name="preferredDate"
                      min={today}
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, preferredTime: time }))}
                          className={`py-2 px-3 text-sm rounded-md border ${
                            formData.preferredTime === time
                              ? 'bg-primary-100 border-primary-500 text-primary-700'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="3"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Any special requests or questions..."
                    />
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm text-gray-500 mb-4">
                      By booking a viewing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowBookingModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                        disabled={isSubmitting || !formData.preferredTime}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4 mr-2" />
                            Confirm Booking
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyPublicView;
