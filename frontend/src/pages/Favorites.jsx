import { useState, useEffect } from 'react';
import { Heart, MapPin, DollarSign, Bed, Bath, Home, Trash2, Eye, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import { propertyService } from '../services/propertyService';
import { formatCurrency } from '../utils/formatters';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await propertyService.getFavorites();
      console.log('Favorites API response:', data);
      
      // Handle both paginated and non-paginated responses
      const favoritesArray = data.results || data;
      console.log('Favorites array:', favoritesArray);
      
      setFavorites(Array.isArray(favoritesArray) ? favoritesArray : []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      console.error('Error details:', error.response?.data);
      
      // Handle specific backend error
      if (error.response?.status === 500) {
        setError('Backend server error. The favorites feature is temporarily unavailable.');
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError(error.message || 'Failed to load favorites');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (propertyId) => {
    setRemovingId(propertyId);
    try {
      await propertyService.toggleFavorite(propertyId);
      setFavorites(favorites.filter(fav => fav.property.id !== propertyId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            My Favorites
          </h1>
          <p className="text-gray-600 mt-2">
            {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <div className="font-semibold">Error loading favorites</div>
                  <div className="text-sm">{error}</div>
                  <div className="text-xs mt-2">
                    Please check the browser console (F12) for more details.
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadFavorites}
                className="ml-4"
              >
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <Card className="text-center py-16">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6">
              Start exploring properties and save your favorites for quick access
            </p>
            <Link to="/properties">
              <Button>
                <Home className="w-5 h-5 mr-2" />
                Browse Properties
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const property = favorite.property;
              const primaryImage = property.images?.find(img => img.is_primary) || property.images?.[0];

              return (
                <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Property Image */}
                  <div className="relative h-48 bg-gray-200">
                    {primaryImage ? (
                      <img
                        src={primaryImage.image}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Home className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Favorite Button */}
                    <button
                      onClick={() => handleRemoveFavorite(property.id)}
                      disabled={removingId === property.id}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Remove from favorites"
                    >
                      {removingId === property.id ? (
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      )}
                    </button>

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge variant={property.status === 'available' ? 'success' : 'warning'}>
                        {property.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {property.title}
                    </h3>

                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="line-clamp-1">{property.city}, {property.area || property.district}</span>
                    </div>

                    {/* Property Details */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.bathrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        <span className="capitalize">{property.property_type}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-primary-600">
                          {formatCurrency(property.rent_price)}
                        </div>
                        <div className="text-xs text-gray-500">per month</div>
                      </div>
                      {property.deposit > 0 && (
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            Deposit: {formatCurrency(property.deposit)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Added Date */}
                    <div className="flex items-center text-xs text-gray-500 mb-4 pb-4 border-b">
                      <Calendar className="w-3 h-3 mr-1" />
                      Added {new Date(favorite.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link to={`/properties/${property.id}`} className="flex-1">
                        <Button variant="primary" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFavorite(property.id)}
                        disabled={removingId === property.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Tips Section */}
        {favorites.length > 0 && (
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for Managing Favorites</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Compare multiple properties side by side</li>
              <li>• Check back regularly for price updates</li>
              <li>• Contact owners early for popular properties</li>
              <li>• Remove properties you're no longer interested in</li>
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Favorites;
