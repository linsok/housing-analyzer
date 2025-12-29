import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, Heart, MapPin, Bed, Bath, Ruler, Users, Home, 
  Building, Hotel, Castle, X, Calendar, Clock, MessageCircle, 
  Phone, Send, Loader2, CreditCard, CalendarCheck, UserPlus, Mail
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { bookingService } from '../services/bookingService';
import { reviewService } from '../services/reviewService';
import { useAuthStore } from '../store/useAuthStore';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import ImageViewer from '../components/ImageViewer';
import StarRating from '../components/StarRating';
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
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
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

    const fetchReviews = async () => {
      try {
        const data = await reviewService.getReviews(id);
        setReviews(data.results || data);
        
        // Check if current user has already rated
        if (isAuthenticated) {
          const userReview = (data.results || data).find(review => review.reviewer?.id === user.id);
          if (userReview) {
            setUserRating(userReview.overall_rating);
          }
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    const fetchComments = async () => {
      try {
        // For now, we'll use reviews as comments since they have comment field
        const data = await reviewService.getReviews(id);
        setComments(data.results || data);
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    };

    if (id) {
      fetchProperty();
      fetchReviews();
      fetchComments();
    } else {
      setError('No property ID provided');
      setLoading(false);
    }
  }, [id, isAuthenticated, user]);

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
      const response = await bookingService.scheduleViewing(property.id, {
        visit_time: visitTime,
        notes: formData.message || 'I would like to book a viewing for this property.',
        contact_info: {
          name: formData.name || user?.full_name || '',
          email: formData.email || user?.email || '',
          phone: formData.phone || ''
        }
      });
      
      // Show success message from backend response
      toast.success(response.message || 'Viewing booked successfully! The owner will contact you soon to confirm.');
      setShowBookingModal(false);
      setFormData(prev => ({
        ...prev,
        preferredDate: '',
        preferredTime: '',
        message: ''
      }));
    } catch (error) {
      console.error('Error booking viewing:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to book viewing. Please try again.';
      toast.error(errorMessage);
      
      // If the error is about time slot, refresh available slots
      if (error.response?.status === 409) {
        // You might want to refresh the page or available slots here
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingSubmit = async (rating) => {
    if (!isAuthenticated) {
      toast.error('Please login to rate this property');
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }

    setIsSubmittingRating(true);
    try {
      await reviewService.createReview({
        property: property.id,
        overall_rating: rating,
        comment: `Rated ${rating} stars`
      });
      
      setUserRating(rating);
      toast.success('Thank you for rating this property!');
      
      // Refresh reviews to update average
      const data = await reviewService.getReviews(id);
      setReviews(data.results || data);
      
      // Update property rating
      const updatedProperty = await propertyService.getProperty(id);
      setProperty(updatedProperty);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error(error.response?.data?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmittingComment(true);
    try {
      // Check if user already has a review for this property
      const existingReview = reviews.find(review => review.reviewer?.id === user.id);
      
      if (existingReview) {
        // Update existing review by appending to comment
        const updatedComment = existingReview.comment 
          ? `${existingReview.comment}\n\n---\n\n${newComment.trim()}`
          : newComment.trim();
        
        console.log('Updating review with ID:', existingReview.id);
        console.log('Update data:', {
          comment: updatedComment,
          title: existingReview.title || 'Review',
          overall_rating: existingReview.overall_rating || 1
        });
        
        await reviewService.updateReview(existingReview.id, {
          comment: updatedComment,
          title: existingReview.title || 'Review',
          overall_rating: existingReview.overall_rating || 1,
          property: property.id // Explicitly send property ID
        });
        
        setNewComment('');
        toast.success('Comment added to your existing review!');
      } else {
        // Create new review
        await reviewService.createReview({
          property: property.id,
          overall_rating: 1, // Minimum rating of 1 for comments
          title: 'Comment',
          comment: newComment.trim()
        });
        
        setNewComment('');
        toast.success('Comment posted successfully!');
      }
      
      // Refresh comments
      const data = await reviewService.getReviews(id);
      setComments(data.results || data);
    } catch (error) {
      console.error('Error submitting comment:', error);
      console.error('Error response data:', error.response?.data);
      toast.error(error.response?.data?.message || error.response?.data?.detail || 'Failed to post comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
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

  // Prepare images for gallery
  const imageSources = [];
  if (property?.images && property.images.length > 0) {
    // Add primary image first
    const primaryImage = property.images.find(img => img.is_primary);
    if (primaryImage) {
      imageSources.push(primaryImage.image);
    }
    // Add other images
    property.images.forEach(img => {
      if (!img.is_primary && img.image) {
        imageSources.push(img.image);
      }
    });
  }

  if (loading) return <Loading />;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
  if (!property) return <div className="container mx-auto px-4 py-8">Property not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* IMAGE GALLERY - AIRBNB STYLE HERO + GRID */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="relative">
          {imageSources.length > 0 ? (
            <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[600px]">
              {/* Hero Image - Takes 2x2 space */}
              <div 
                className="col-span-2 row-span-2 relative group cursor-pointer"
                onClick={() => {
                  setCurrentImageIndex(0);
                  setShowImageViewer(true);
                }}
              >
                <img
                  src={imageSources[0]}
                  alt={property.title}
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
                    setCurrentImageIndex(i + 1);
                    setShowImageViewer(true);
                  }}
                >
                  <img
                    src={img}
                    alt={`${property.title} - Image ${i + 2}`}
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
                    setCurrentImageIndex(0);
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
          ) : (
            <div className="h-96 bg-gray-200 flex items-center justify-center rounded-xl">
              <span className="text-gray-400">No images available</span>
            </div>
          )}
        </div>

        {/* View All Photos Button */}
        {imageSources.length > 0 && (
          <div className="p-6 pt-0">
            <button
              onClick={() => {
                setCurrentImageIndex(0);
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
        )}

        {/* IMAGE VIEWER */}
        {showImageViewer && (
          <ImageViewer
            isOpen
            images={imageSources}
            currentIndex={currentImageIndex}
            onClose={() => setShowImageViewer(false)}
            onImageChange={setCurrentImageIndex}
          />
        )}
      </div>

      {/* PROPERTY DETAILS */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">

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
              
              {/* Star Rating Section */}
              <div className="mt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Property Rating:</span>
                    <StarRating 
                      rating={parseFloat(property.rating) || 0}
                      readOnly={true}
                      size="md"
                      showCount={true}
                      count={reviews.length}
                    />
                    {property.rating > 0 && (
                      <span className="text-sm font-semibold text-primary-600">
                        {parseFloat(property.rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* User Rating */}
                {isAuthenticated && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">
                        {userRating > 0 ? 'Your Rating:' : 'Rate this property:'}
                      </span>
                      <StarRating 
                        rating={userRating}
                        onRatingChange={handleRatingSubmit}
                        readOnly={userRating > 0 || isSubmittingRating}
                        size="sm"
                      />
                      {isSubmittingRating && (
                        <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                      )}
                      {userRating > 0 && (
                        <span className="text-xs text-green-600 font-medium">Rated</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">${formatPrice(property.rent_price)}/month</div>
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
      <p className="text-gray-600 mb-6">Contact the property owner about this property by Phone Number or Email.</p>
      
      {/* Owner Contact Information */}
      <div className="space-y-3 mb-6">
        {property?.owner?.phone ? (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-600" />
              <span className="font-medium">Owner Phone:</span>
              <span className="text-primary-600">{property.owner.phone}</span>
            </div>
            <Button 
              size="sm" 
              onClick={() => window.open(`tel:${property.owner.phone}`)}
            >
              Call
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-500">Owner Phone:</span>
              <span className="text-gray-400">Not available</span>
            </div>
          </div>
        )}
        
        {property?.owner?.email ? (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-600" />
              <span className="font-medium">Owner Email:</span>
              <span className="text-primary-600 text-sm">{property.owner.email}</span>
            </div>
            <Button 
              size="sm" 
              onClick={() => window.open(`mailto:${property.owner.email}`)}
            >
              Email
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-500">Owner Email:</span>
              <span className="text-gray-400">Not available</span>
            </div>
          </div>
        )}
      </div>
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

      {/* COMMENTS SECTION */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Property Comments</h2>
          
          {/* Comment Form */}
          {isAuthenticated && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave a Comment
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    rows="3"
                    placeholder="Share your thoughts about this property..."
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="flex items-center"
                  >
                    {isSubmittingComment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={comment.id || index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      {comment.reviewer?.profile_picture ? (
                        <img
                          src={comment.reviewer.profile_picture}
                          alt={comment.reviewer.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-gray-600">
                          {comment.reviewer?.full_name?.[0] || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.reviewer?.full_name || 'Anonymous'}
                        </span>
                        {comment.overall_rating > 0 && (
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < comment.overall_rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-gray-200 text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm mb-2">
                        {comment.comment}
                      </p>
                      <div className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPublicView;
