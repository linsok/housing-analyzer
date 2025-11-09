import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, MapPin, Bed, Bath, Ruler, Users, Home, Building, Hotel, Castle } from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { useAuthStore } from '../store/useAuthStore';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';

const PropertyPublicView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await propertyService.getPropertyById(id);
        setProperty(data);
      } catch (err) {
        setError('Failed to load property details');
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    // Handle contact owner logic
    console.log('Contacting owner for property:', property.id);
  };

  const handleSaveProperty = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    // Handle save property logic
    console.log('Saving property:', property.id);
  };

  const handleBookViewing = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}/book` } });
      return;
    }
    // Handle book viewing logic
    console.log('Booking viewing for property:', property.id);
  };

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
            <Button 
              variant="primary" 
              className="w-full sm:w-auto"
              onClick={handleBookViewing}
            >
              Book Viewing
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={handleContactOwner}
            >
              Contact Owner
            </Button>
            <Button 
              variant="ghost" 
              className="w-full sm:w-auto"
              onClick={handleSaveProperty}
            >
              <Heart className="w-5 h-5 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPublicView;
