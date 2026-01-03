import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Heart, CheckCircle, Star, Award } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import Badge from './ui/Badge';
import { useState } from 'react';
import { propertyService } from '../services/propertyService';
import { useAuthStore } from '../store/useAuthStore';

const PropertyCard = ({ property, onFavoriteToggle }) => {
  const { isAuthenticated } = useAuthStore();
  const [isFavorited, setIsFavorited] = useState(property.is_favorited || false);
  const [loading, setLoading] = useState(false);

  // Debug logging
  console.log('🏠 PropertyCard rendering:', {
    id: property.id,
    title: property.title,
    recommendation_type: property.recommendation_type,
    isRecommended: property.is_recommended || property.featured || property.recommendation_type
  });

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to save favorites');
      return;
    }

    setLoading(true);
    try {
      const response = await propertyService.toggleFavorite(property.id);
      setIsFavorited(response.is_favorited);
      if (onFavoriteToggle) onFavoriteToggle();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate average rating
  const averageRating = property.average_rating || 0;
  const reviewCount = property.review_count || 0;
  
  // Check availability
  const isAvailable = property.availability_status === 'available' || property.is_available !== false;
  
  // Check if recommended (old system + new recommendation system)
  const isRecommended = property.is_recommended || property.featured || property.recommendation_type || false;
  
  // Check if it's from our new 4-criteria recommendation system
  const isNewRecommendation = property.recommendation_type && (
    property.recommendation_type === 'most_booked' ||
    property.recommendation_type === 'highest_rated' ||
    property.recommendation_type === 'user_search_based' ||
    property.recommendation_type === 'average_price'
  );

  // Debug recommendation detection
  console.log('🎯 Recommendation detection:', {
    propertyId: property.id,
    propertyTitle: property.title,
    recommendation_type: property.recommendation_type,
    isRecommended: isRecommended,
    isNewRecommendation: isNewRecommendation,
    willShowOverlay: isNewRecommendation
  });

  return (
    <Link to={`/properties/${property.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {property.primary_image || property.image || (property.images && property.images.length > 0) ? (
            <img
              src={property.primary_image || property.image || (property.images && property.images[0]?.image)}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                console.log('Image failed to load:', e.target.src);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">No Image Available</p>
              </div>
            </div>
          )}
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            disabled={loading}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
          >
            <Heart
              className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>

          {/* Rating Stars on Surface */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-md">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-semibold text-gray-800">
              {property.rating && !isNaN(property.rating) ? parseFloat(property.rating).toFixed(1) : '0.0'}
            </span>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-600">({reviewCount})</span>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {/* Only show recommended badge for legacy system, new system has prominent overlay */}
            {isRecommended && !isNewRecommendation && (
              <Badge variant="warning" className="flex items-center gap-1 bg-amber-500 text-white">
                <Award className="w-3 h-3" />
                Recommended
              </Badge>
            )}
            {property.is_furnished && (
              <Badge variant="info">Furnished</Badge>
            )}
            {!isAvailable && (
              <Badge variant="danger" className="bg-red-500 text-white">
                Not Available
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="line-clamp-1">{property.area}, {property.city}</span>
          </div>

          {/* Rating */}
          {averageRating > 0 && (
            <div className="flex items-center gap-1 mb-3">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= averageRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} {reviewCount > 0 && `(${reviewCount} reviews)`}
              </span>
            </div>
          )}

          {/* Features */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
            {property.area_sqm && (
              <div className="flex items-center">
                <Square className="w-4 h-4 mr-1" />
                <span>{property.area_sqm}m²</span>
              </div>
            )}
          </div>
          {/* Amenities */}


          {/* Price and Status */}
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(property.rent_price, property.currency)}
                </span>
                <span className="text-gray-600 text-sm ml-1">/month</span>
              </div>
              
              {property.owner_verified && (
                <Badge variant="success" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Owner
                </Badge>
              )}
            </div>
            
            {/* Availability Status */}
            <div className="flex items-center justify-between text-sm">
              <span className={`font-medium ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {isAvailable ? '✓ Available Now' : '✗ Not Available'}
              </span>
              {property.property_type && (
                <span className="text-gray-500 capitalize">{property.property_type}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
