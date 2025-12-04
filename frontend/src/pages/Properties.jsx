import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Heart, MapPin, Star } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loading from '../components/ui/Loading';
import Card from '../components/ui/Card';
import { propertyService } from '../services/propertyService';
import { useAuthStore } from '../store/useAuthStore';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [properties, setProperties] = useState([]);
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const [savedProperties, setSavedProperties] = useState(new Set());
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    address: searchParams.get('address') || '',
    property_type: searchParams.get('property_type') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    min_bedrooms: searchParams.get('min_bedrooms') || '',
    is_furnished: searchParams.get('is_furnished') || '',
    pets_allowed: searchParams.get('pets_allowed') || '',
  });

  // Auto-apply filters when they change (except for search)
  useEffect(() => {
    if (filters.city !== searchParams.get('search')) {
      applyFilters();
    }
  }, [filters.city, filters.address, filters.property_type, filters.min_price, filters.max_price, filters.min_bedrooms, filters.is_furnished, filters.pets_allowed]);

  // Handle save property action
  // Handle search on Enter key
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  // Helper function to normalize search text (case-insensitive and remove spaces)
  const normalizeSearchText = (text) => {
    return text.toLowerCase().replace(/\s+/g, '');
  };

  // Helper function to check if property matches search criteria
  const propertyMatchesSearch = (property, searchQuery) => {
    if (!searchQuery) return true;
    
    const normalizedQuery = normalizeSearchText(searchQuery);
    
    // Search in multiple fields with normalized text
    const searchableFields = [
      property.title || '',
      property.description || '',
      property.city || '',
      property.area || '',
      property.district || '',
      property.address || '',
      property.property_type || '',
    ];
    
    return searchableFields.some(field => 
      normalizeSearchText(field).includes(normalizedQuery)
    );
  };

  const handleSaveProperty = async (propertyId, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/properties' } });
      return;
    }
    
    try {
      // Toggle save status
      if (savedProperties.has(propertyId)) {
        // Call API to remove from saved
        // await propertyService.unsaveProperty(propertyId);
        setSavedProperties(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
      } else {
        // Call API to save
        // await propertyService.saveProperty(propertyId);
        setSavedProperties(prev => new Set(prev).add(propertyId));
      }
    } catch (error) {
      console.error('Error saving property:', error);
    }
  };
  
  // Update filters when URL parameters change
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      city: searchParams.get('city') || '',
      address: searchParams.get('address') || '',
      property_type: searchParams.get('property_type') || '',
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || '',
      min_bedrooms: searchParams.get('min_bedrooms') || '',
      is_furnished: searchParams.get('is_furnished') || '',
      pets_allowed: searchParams.get('pets_allowed') || '',
    });
  }, [searchParams]);

  useEffect(() => {
    loadProperties();
    loadRecommendedProperties();
  }, [filters]);

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) params[key] = filters[key];
      });
      
      const response = await propertyService.getProperties(params);
      let allProperties = response.results || response;
      
      // Apply client-side search filtering for case-insensitive search with space handling
      if (filters.search) {
        allProperties = allProperties.filter(property => 
          propertyMatchesSearch(property, filters.search)
        );
      }
      
      setProperties(allProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
      setError(error.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendedProperties = async () => {
    try {
      const response = await propertyService.getRecommended();
      // Add mock data for demonstration if no recommended properties
      const recommended = response.results || response;
      setRecommendedProperties(recommended.slice(0, 3));
    } catch (error) {
      console.error('Error loading recommended properties:', error);
    }
  };

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    const params = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) params[key] = filters[key];
    });
    setSearchParams(params);
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      city: '',
      address: '',
      property_type: '',
      min_price: '',
      max_price: '',
      min_bedrooms: '',
      is_furnished: '',
      pets_allowed: '',
    });
    setSearchParams({});
  }, []);

  const navigateToProperty = (id) => {
    navigate(`/properties/${id}`);
  };

  const handleContactOwner = (e, property) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${property.id}` } });
      return;
    }
    // Handle contact owner logic
    console.log('Contacting owner for property:', property.id);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Perfect Home</h1>
        <p className="text-gray-600">Browse through our selection of properties across Cambodia</p>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Filters'}
          </Button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="e.g., Phnom Penh"
                className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address/Area
              </label>
              <input
                type="text"
                name="address"
                value={filters.address}
                onChange={handleFilterChange}
                placeholder="e.g., Sen Sok, BKK"
                className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select
                name="property_type"
                value={filters.property_type}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="room">Room</option>
                <option value="studio">Studio</option>
                <option value="condo">Condo</option>
                <option value="villa">Villa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price ($)
              </label>
              <input
                type="number"
                name="min_price"
                value={filters.min_price}
                onChange={handleFilterChange}
                placeholder="0"
                className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price ($)
              </label>
              <input
                type="number"
                name="max_price"
                value={filters.max_price}
                onChange={handleFilterChange}
                placeholder="10000"
                className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

              <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Bedrooms
              </label>
              <input
                type="number"
                name="min_bedrooms"
                value={filters.min_bedrooms}
                onChange={handleFilterChange}
                placeholder="1"
                className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Furnished
                </label>
                <select
                  name="is_furnished"
                  value={filters.is_furnished}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any</option>
                  <option value="true">Furnished</option>
                  <option value="false">Unfurnished</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pets Allowed
                </label>
                <select
                  name="pets_allowed"
                  value={filters.pets_allowed}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
              </select>
            </div>

            <div className="col-span-full flex gap-2 mt-4">
              <Button onClick={applyFilters}>Apply Filters</Button>
              <Button variant="outline" onClick={clearFilters}>Clear All</Button>
            </div>
          </div>
        )}

        {/* Results Header with Stats */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">All Properties</h2>
            <div className="text-gray-600">
              {!loading && `${properties.length} properties found`}
            </div>
          </div>
          
          {/* Quick Stats */}
          {!loading && properties.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {properties.filter(p => p.availability_status === 'available' || p.is_available !== false).length}
                </div>
                <div className="text-sm text-gray-600">Available Now</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {properties.filter(p => p.verification_status === 'verified').length}
                </div>
                <div className="text-sm text-gray-600">Verified</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {properties.filter(p => p.is_furnished).length}
                </div>
                <div className="text-sm text-gray-600">Furnished</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">
                  ${properties.length > 0 ? Math.round(properties.reduce((sum, p) => sum + p.rent_price, 0) / properties.length) : 0}
                </div>
                <div className="text-sm text-gray-600">Avg. Price</div>
              </Card>
            </div>
          )}
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <Card className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Properties</h3>
              <p className="text-gray-600 mb-4">
                The backend server might not be running or there's a connection issue.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-left mb-4">
              <h4 className="font-semibold mb-2">To fix this issue:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Make sure the backend server is running on <code className="bg-gray-200 px-2 py-1 rounded">http://localhost:8000</code></li>
                <li>Check if you have any properties in the database</li>
                <li>If you're an admin or owner, try adding some properties first</li>
                <li>Verify your API connection in the browser console</li>
              </ol>
            </div>
            <Button onClick={loadProperties} className="mt-4">
              Try Again
            </Button>
          </Card>
        ) : properties.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
              <p className="text-gray-600 mb-4">
                {Object.values(filters).some(v => v) 
                  ? "No properties match your search criteria. Try adjusting your filters."
                  : "There are no properties available yet. Please check back later or contact support."}
              </p>
            </div>
            {Object.values(filters).some(v => v) && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear All Filters
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} onFavoriteToggle={loadProperties} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
