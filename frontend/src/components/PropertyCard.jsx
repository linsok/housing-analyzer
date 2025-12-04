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
  
  // Check if recommended
  const isRecommended = property.is_recommended || property.featured || false;

  return (
    <Link to={`/properties/${property.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {property.primary_image ? (
            <img
              src={property.primary_image}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
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

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isRecommended && (
              <Badge variant="warning" className="flex items-center gap-1 bg-amber-500 text-white">
                <Award className="w-3 h-3" />
                Recommended
              </Badge>
            )}
            {property.verification_status === 'verified' && (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Verified
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
