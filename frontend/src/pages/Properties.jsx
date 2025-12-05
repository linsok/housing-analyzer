import { useState, useEffect } from 'react';
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
  
  // Handle save property action
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
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    address: searchParams.get('address') || '',
    property_type: searchParams.get('property_type') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    min_bedrooms: searchParams.get('min_bedrooms') || '',
    min_size: searchParams.get('min_size') || '',
    max_size: searchParams.get('max_size') || '',
    is_furnished: searchParams.get('is_furnished') || '',
    pets_allowed: searchParams.get('pets_allowed') || '',
    availability_status: searchParams.get('availability_status') || '',
    rental_type: searchParams.get('rental_type') || '',
    owner_name: searchParams.get('owner_name') || '',
    posted_date_from: searchParams.get('posted_date_from') || '',
    posted_date_to: searchParams.get('posted_date_to') || '',
    sort_by: searchParams.get('sort_by') || 'relevance',
  });

  useEffect(() => {
    loadProperties();
    loadRecommendedProperties();
  }, [searchParams]);

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] && key !== 'search') params[key] = filters[key];
      });
      
      const response = await propertyService.getProperties(params);
      let allProperties = response.results || response;
      
      // Filter to show only verified properties
      allProperties = allProperties.filter(property => 
        property.verification_status === 'verified'
      );
      
      // Apply advanced search filtering
      if (filters.search) {
        allProperties = allProperties.filter(property => 
          propertyMatchesAdvancedSearch(property, filters.search)
        );
      }
      
      // Apply all other filters
      allProperties = allProperties.filter(property => 
        propertyMatchesFilters(property, filters)
      );
      
      // Apply sorting
      allProperties = applySorting(allProperties, filters.sort_by || 'relevance');
      
      setProperties(allProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
      setError(error.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const handleFilterChange = (fieldName, value) => {
    setFilters({ ...filters, [fieldName]: value });
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

  // Advanced search utilities
  const normalizeText = (text) => {
    return text.toLowerCase()
      .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
      .trim()                         // Remove leading/trailing spaces
      .replace(/[^\w\s]/g, '');       // Remove special characters
  };

  const getSynonyms = (term) => {
    const synonyms = {
      'apt': 'apartment',
      'apts': 'apartment',
      'condo': 'condominium',
      'condos': 'condominium',
      'villa': 'house',
      'villas': 'house',
      'studio': 'apartment',
      'studios': 'apartment',
      'flat': 'apartment',
      'flats': 'apartment',
      'br': 'bedroom',
      'bdr': 'bedroom',
      'bdrm': 'bedroom',
      'bath': 'bathroom',
      'ba': 'bathroom',
      'sqm': 'area',
      'm2': 'area',
      'rent': 'rental',
      'renting': 'rental',
      'furnish': 'furnished',
      'unfurnish': 'unfurnished'
    };
    return synonyms[term.toLowerCase()] || term;
  };

  const tokenizeAndNormalize = (text) => {
    const stopWords = ['for', 'in', 'on', 'at', 'the', 'a', 'an', 'and', 'or', 'with', 'to', 'of'];
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')           // Replace special chars with space
      .split(/\s+/)                        // Split into words
      .map(word => word.trim())            // Trim each word
      .filter(word => word.length > 0)     // Remove empty strings
      .filter(word => !stopWords.includes(word)) // Remove stop words
      .map(word => getSynonyms(word))      // Replace synonyms
      .join(' ');
  };

  const fuzzyMatch = (text, searchTerms, tolerance = 1) => {
    const words = text.toLowerCase().split(/\s+/);
    return searchTerms.every(searchTerm => {
      return words.some(word => {
        if (word.includes(searchTerm)) return true;
        
        // Simple fuzzy matching - allow up to tolerance character differences
        if (Math.abs(word.length - searchTerm.length) <= tolerance) {
          let differences = 0;
          const maxLength = Math.max(word.length, searchTerm.length);
          for (let i = 0; i < maxLength; i++) {
            if (word[i] !== searchTerm[i]) differences++;
            if (differences > tolerance) return false;
          }
          return true;
        }
        return false;
      });
    });
  };

  const propertyMatchesAdvancedSearch = (property, searchTerm) => {
    if (!searchTerm) return true;
    
    // Step 1: Normalize search text (lowercase, trim, remove special characters)
    const normalizedSearch = normalizeText(searchTerm);
    
    // Step 2: Tokenize search text (split words, remove stopwords)
    const tokenizedSearch = tokenizeAndNormalize(searchTerm);
    const searchTerms = tokenizedSearch.split(/\s+/).filter(term => term.length > 0);
    
    // Step 3: Build combined searchable content from all property fields
    const searchableFields = [
      // Text fields for keyword search
      property.title || '',
      property.description || '',
      property.city || '',
      property.district || '',
      property.address || '',
      property.neighborhood || '',
      property.province || '',
      property.area || '',
      property.property_type || '',
      
      // Numeric keyword matches
      (property.bedrooms ? `${property.bedrooms}br` : ''),
      (property.bedrooms ? `${property.bedrooms} bdr` : ''),
      (property.bedrooms ? `${property.bedrooms} bdrm` : ''),
      (property.bedrooms ? `${property.bedrooms} bedroom` : ''),
      (property.bedrooms ? `${property.bedrooms} bedrooms` : ''),
      (property.bathrooms ? `${property.bathrooms}bath` : ''),
      (property.bathrooms ? `${property.bathrooms} ba` : ''),
      (property.bathrooms ? `${property.bathrooms} bathroom` : ''),
      (property.bathrooms ? `${property.bathrooms} bathrooms` : ''),
      
      // Area shorthand matches
      (property.area_sqm ? `${property.area_sqm}sqm` : ''),
      (property.area_sqm ? `${property.area_sqm} m2` : ''),
      (property.area_sqm ? `${property.area_sqm}m2` : ''),
      (property.area_sqm ? `${property.area_sqm} sqm` : ''),
      (property.area_sqm ? `${property.area_sqm} square meters` : ''),
      
      // Price keyword matches
      (property.rent_price ? `$${property.rent_price}` : ''),
      (property.rent_price ? `${property.rent_price}$` : ''),
      (property.rent_price ? `${property.rent_price} dollars` : ''),
      (property.rent_price ? `${property.rent_price} price` : ''),
      
      // Amenity keyword matches
      (property.is_furnished ? 'furnished' : ''),
      (property.is_furnished ? 'fully furnished' : ''),
      (!property.is_furnished ? 'unfurnished' : ''),
      (property.pets_allowed ? 'pets allowed' : ''),
      (property.pets_allowed ? 'pet friendly' : ''),
      (property.parking_available ? 'parking' : ''),
      (property.parking_available ? 'parking available' : ''),
      (property.air_conditioning ? 'ac' : ''),
      (property.air_conditioning ? 'air conditioning' : ''),
      (property.air_conditioning ? 'aircon' : ''),
      (property.swimming_pool ? 'pool' : ''),
      (property.swimming_pool ? 'swimming pool' : ''),
      (property.gym ? 'gym' : ''),
      (property.gym ? 'fitness' : ''),
      (property.gym ? 'gymnasium' : ''),
      
      // Additional fields for comprehensive search
      (property.floor_number ? `floor ${property.floor_number}` : ''),
      (property.floor_number ? `level ${property.floor_number}` : ''),
      (property.deposit ? `deposit $${property.deposit}` : ''),
      (property.availability_status ? property.availability_status : ''),
      (property.rental_type ? property.rental_type : ''),
    ];
    
    const combinedContent = searchableFields.join(' ').toLowerCase();
    const normalizedContent = normalizeText(combinedContent);
    const tokenizedContent = tokenizeAndNormalize(combinedContent);
    
    // Step 4: Exact match - check if normalized content contains normalized search text
    const exactMatch = normalizedContent.includes(normalizedSearch);
    
    // Step 5: Token match - all search terms must exist inside tokenized content
    const tokenMatch = searchTerms.every(term => tokenizedContent.includes(term));
    
    // Step 6: Fuzzy match - words allowed ±1 character difference
    const fuzzyMatchResult = fuzzyMatch(combinedContent, searchTerms);
    
    // Step 7: Specialized keyword matching
    
    // Bedroom shorthand match (br, bdr, bdrm)
    const bedroomMatch = searchTerms.some(term => {
      const bedroomRegex = /(\d+)br?|bdr?m?|bedroom?s?/;
      const match = term.match(bedroomRegex);
      if (match && property.bedrooms) {
        return property.bedrooms >= parseInt(match[1]);
      }
      return false;
    });
    
    // Area shorthand match (sqm, m2)
    const areaMatch = searchTerms.some(term => {
      const areaRegex = /(\d+)(sqm|m2)/;
      const match = term.match(areaRegex);
      if (match && property.area_sqm) {
        const searchArea = parseInt(match[1]);
        return Math.abs(property.area_sqm - searchArea) <= 10; // Allow 10sqm tolerance
      }
      return false;
    });
    
    // Price keyword match ($500, 700$)
    const priceMatch = searchTerms.some(term => {
      const priceRegex = /\$?(\d+)\$?/;
      const match = term.match(priceRegex);
      if (match && property.rent_price) {
        const searchPrice = parseInt(match[1]);
        return Math.abs(property.rent_price - searchPrice) <= 100; // Allow $100 tolerance
      }
      return false;
    });
    
    // Amenity keyword match (furnished, pool, parking)
    const amenityMatch = searchTerms.some(term => {
      const amenities = [
        { term: 'furnished', check: property.is_furnished },
        { term: 'unfurnished', check: !property.is_furnished },
        { term: 'pool', check: property.swimming_pool },
        { term: 'parking', check: property.parking_available },
        { term: 'ac', check: property.air_conditioning },
        { term: 'aircon', check: property.air_conditioning },
        { term: 'gym', check: property.gym },
        { term: 'fitness', check: property.gym },
        { term: 'pets', check: property.pets_allowed },
        { term: 'pet', check: property.pets_allowed }
      ];
      
      return amenities.some(amenity => 
        term.includes(amenity.term) && amenity.check
      );
    });
    
    // Boolean keyword match ("pets allowed", "ac", "gym")
    const booleanMatch = searchTerms.some(term => {
      const booleanPhrases = [
        { phrase: 'pets allowed', check: property.pets_allowed },
        { phrase: 'pet friendly', check: property.pets_allowed },
        { phrase: 'air conditioning', check: property.air_conditioning },
        { phrase: 'parking available', check: property.parking_available },
        { phrase: 'swimming pool', check: property.swimming_pool }
      ];
      
      return booleanPhrases.some(item => 
        term.includes(item.phrase) && item.check
      );
    });
    
    // Return true if any matching strategy succeeds
    return (
      exactMatch || 
      tokenMatch || 
      fuzzyMatchResult || 
      bedroomMatch || 
      areaMatch || 
      priceMatch || 
      amenityMatch || 
      booleanMatch
    );
  };

  const propertyMatchesFilters = (property, filters) => {
    // Location filters - Partial match
    if (filters.city && !normalizeText(property.city || '').includes(normalizeText(filters.city))) {
      return false;
    }
    
    if (filters.address) {
      const normalizedAddress = normalizeText(filters.address);
      const addressFields = [
        property.address || '',
        property.neighborhood || '',
        property.district || '',
        property.area || ''
      ].join(' ');
      
      if (!normalizeText(addressFields).includes(normalizedAddress)) {
        return false;
      }
    }
    
    // Property type - Exact match
    if (filters.property_type && property.property_type !== filters.property_type) {
      return false;
    }
    
    // Price range - Between min & max
    if (filters.min_price && (!property.rent_price || property.rent_price < parseFloat(filters.min_price))) {
      return false;
    }
    
    if (filters.max_price && (!property.rent_price || property.rent_price > parseFloat(filters.max_price))) {
      return false;
    }
    
    // Bedrooms - Always ≥ selected
    if (filters.min_bedrooms && (!property.bedrooms || property.bedrooms < parseInt(filters.min_bedrooms))) {
      return false;
    }
    
    // Size - Range numeric
    if (filters.min_size && (!property.area_sqm || property.area_sqm < parseFloat(filters.min_size))) {
      return false;
    }
    
    if (filters.max_size && (!property.area_sqm || property.area_sqm > parseFloat(filters.max_size))) {
      return false;
    }
    
    // Amenities - Multiple AND filters
    if (filters.is_furnished === 'true' && !property.is_furnished) {
      return false;
    }
    
    if (filters.is_furnished === 'false' && property.is_furnished) {
      return false;
    }
    
    if (filters.pets_allowed === 'true' && !property.pets_allowed) {
      return false;
    }
    
    if (filters.pets_allowed === 'false' && property.pets_allowed) {
      return false;
    }
    
    // Status - Exact match
    if (filters.availability_status && property.availability_status !== filters.availability_status) {
      return false;
    }
    
    // Rental type - Exact match
    if (filters.rental_type && property.rental_type !== filters.rental_type) {
      return false;
    }
    
    // Owner - Partial match
    if (filters.owner_name) {
      const ownerFields = [
        property.owner_name || '',
        property.owner_email || '',
        property.owner_phone || ''
      ].join(' ');
      
      if (!normalizeText(ownerFields).includes(normalizeText(filters.owner_name))) {
        return false;
      }
    }
    
    // Posted date - Range
    if (filters.posted_date_from && property.created_at) {
      const postedDate = new Date(property.created_at);
      const fromDate = new Date(filters.posted_date_from);
      if (postedDate < fromDate) return false;
    }
    
    if (filters.posted_date_to && property.created_at) {
      const postedDate = new Date(property.created_at);
      const toDate = new Date(filters.posted_date_to);
      if (postedDate > toDate) return false;
    }
    
    return true;
  };

  const applySorting = (properties, sortBy) => {
    const sorted = [...properties];
    
    switch (sortBy) {
      case 'price_low':
        return sorted.sort((a, b) => (a.rent_price || 0) - (b.rent_price || 0));
      
      case 'price_high':
        return sorted.sort((a, b) => (b.rent_price || 0) - (a.rent_price || 0));
      
      case 'size_large':
        return sorted.sort((a, b) => (b.area_sqm || 0) - (a.area_sqm || 0));
      
      case 'size_small':
        return sorted.sort((a, b) => (a.area_sqm || 0) - (b.area_sqm || 0));
      
      case 'bedrooms_most':
        return sorted.sort((a, b) => (b.bedrooms || 0) - (a.bedrooms || 0));
      
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
      
      case 'most_viewed':
        return sorted.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
      
      case 'most_favorited':
        return sorted.sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0));
      
      default: // 'relevance' or any default
        return sorted;
    }
  };

  const applyFilters = () => {
    const params = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) params[key] = filters[key];
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      address: '',
      property_type: '',
      min_price: '',
      max_price: '',
      min_bedrooms: '',
      min_size: '',
      max_size: '',
      is_furnished: '',
      pets_allowed: '',
      availability_status: '',
      rental_type: '',
      owner_name: '',
      posted_date_from: '',
      posted_date_to: '',
      sort_by: 'relevance',
    });
    setSearchParams({});
  };

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
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search by price, bedrooms, address, city, or any property detail..."
              className="pl-10 w-full"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
          </div>
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
              <Input
                label="City"
                name="city"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="e.g., Phnom Penh"
              />
            </div>

            <div>
              <Input
                label="Address/Area"
                name="address"
                value={filters.address}
                onChange={(e) => handleFilterChange('address', e.target.value)}
                placeholder="e.g., Sen Sok, Toul Kok, BKK"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select
                name="property_type"
                value={filters.property_type}
                onChange={(e) => handleFilterChange('property_type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="condo">Condo</option>
                <option value="studio">Studio</option>
                <option value="room">Room</option>
              </select>
            </div>

            <div>
              <Input
                label="Min Price ($)"
                type="number"
                name="min_price"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <Input
                label="Max Price ($)"
                type="number"
                name="max_price"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
                placeholder="10000"
              />
            </div>

            <div>
              <Input
                label="Min Bedrooms"
                type="number"
                name="min_bedrooms"
                value={filters.min_bedrooms}
                onChange={(e) => handleFilterChange('min_bedrooms', e.target.value)}
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Furnished
              </label>
              <select
                name="is_furnished"
                value={filters.is_furnished}
                onChange={(e) => handleFilterChange('is_furnished', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                onChange={(e) => handleFilterChange('pets_allowed', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
