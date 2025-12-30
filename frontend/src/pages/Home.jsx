import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Shield, Star, MapPin, DollarSign } from 'lucide-react';
import Button from '../components/ui/Button';
import PropertyCard from '../components/PropertyCard';
import Card from '../components/ui/Card';
import { propertyService } from '../services/propertyService';
import Loading from '../components/ui/Loading';
import AIAssistant from '../components/AIAssistant';
import { useAuthStore } from '../store/useAuthStore';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendedProperties();
  }, []);

  const loadRecommendedProperties = async () => {
    try {
      console.log('🔍 Loading recommended properties...');
      console.log('👤 Authenticated:', isAuthenticated);
      
      // Get all 4 recommendation types - handle authentication gracefully
      const [
        mostBookedResponse,
        highestRatedResponse,
        userSearchResponse,
        averagePriceResponse
      ] = await Promise.allSettled([
        propertyService.getMostBookedProperties(3),
        propertyService.getHighestRatedProperties(3),
        isAuthenticated ? propertyService.getUserSearchBasedProperties(3) : Promise.resolve({ properties: [] }),
        propertyService.getAveragePriceProperties(3)
      ]);

      console.log('📡 API Responses (settled):', {
        mostBooked: mostBookedResponse.status,
        highestRated: highestRatedResponse.status,
        userSearch: userSearchResponse.status,
        averagePrice: averagePriceResponse.status
      });

      // Extract data from successful responses
      const mostBookedData = mostBookedResponse.status === 'fulfilled' ? mostBookedResponse.value : { properties: [] };
      const highestRatedData = highestRatedResponse.status === 'fulfilled' ? highestRatedResponse.value : { properties: [] };
      const userSearchData = userSearchResponse.status === 'fulfilled' ? userSearchResponse.value : { properties: [] };
      const averagePriceData = averagePriceResponse.status === 'fulfilled' ? averagePriceResponse.value : { properties: [] };

      console.log('📊 Extracted data:', {
        mostBooked: mostBookedData,
        highestRated: highestRatedData,
        userSearch: userSearchData,
        averagePrice: averagePriceData
      });

      // Combine all recommendations with their criteria labels
      const allRecommendations = [
        ...(mostBookedData.properties || []).map(p => ({
          ...p,
          recommendation_type: 'most_booked',
          recommendation_label: 'Most Booked - Popular & Trusted',
          recommendation_message: mostBookedData.message || 'Most booked properties - popular and trusted options'
        })),
        ...(highestRatedData.properties || []).map(p => ({
          ...p,
          recommendation_type: 'highest_rated',
          recommendation_label: 'Highest Rated - Top Rated by Guests',
          recommendation_message: highestRatedData.message || 'Highest rated properties - top-rated by guests'
        })),
        ...(userSearchData.properties || []).map(p => ({
          ...p,
          recommendation_type: 'user_search_based',
          recommendation_label: 'Recommended For You',
          recommendation_message: userSearchData.message || 'Recommended based on your searches and viewing history'
        })),
        ...(averagePriceData.properties || []).map(p => ({
          ...p,
          recommendation_type: 'average_price',
          recommendation_label: 'Best Value - Average Price',
          recommendation_message: averagePriceData.message || 'Best value properties around average price',
          market_stats: averagePriceData.market_stats
        }))
      ];

      console.log('🎯 Combined recommendations:', allRecommendations);

      // Remove duplicates and limit to 6 total for home page
      const uniqueRecommendations = [];
      const seenIds = new Set();
      
      for (const prop of allRecommendations) {
        if (!seenIds.has(prop.id)) {
          uniqueRecommendations.push(prop);
          seenIds.add(prop.id);
          if (uniqueRecommendations.length >= 6) break;
        }
      }

      console.log('✅ Final recommendations for display:', uniqueRecommendations);
      console.log('📊 Properties that will show overlays:', uniqueRecommendations.map(p => ({
        title: p.title,
        recommendation_type: p.recommendation_type,
        recommendation_label: p.recommendation_label
      })));
      
      setRecommendedProperties(uniqueRecommendations);
      
    } catch (error) {
      console.error('❌ Error loading recommended properties:', error);
      console.log('🔄 Falling back to old method...');
      
      // Fallback to old method if new endpoints fail
      try {
        const response = await propertyService.getRecommended();
        const recommended = response.recommendations || response.results || response;
        console.log('🔄 Fallback data:', recommended);
        setRecommendedProperties(recommended.slice(0, 6));
      } catch (fallbackError) {
        console.error('❌ Error with fallback recommendation loading:', fallbackError);
        // Set empty array to prevent infinite loading
        setRecommendedProperties([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/properties?search=${searchQuery}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Dream Home Across Cambodia
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Compare rent prices, analyze trends, and discover verified properties with confidence
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                />
              </div>
              <Button type="submit" size="lg" className="px-8">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Housing Analyzer?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Properties</h3>
              <p className="text-gray-600">
                All properties are verified by our admin team to ensure authenticity and quality
              </p>
            </Card>

            <Card className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Market Analytics</h3>
              <p className="text-gray-600">
                Access real-time rent trends and compare prices across different areas
              </p>
            </Card>

            <Card className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted Reviews</h3>
              <p className="text-gray-600">
                Read verified reviews from real renters to make informed decisions
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Recommended Properties */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Recommended Properties</h2>
              <p className="text-gray-600">Personalized recommendations based on popularity, ratings, your preferences, and market value</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <Link to="/properties">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
          </div>

          {/* Property List - Below heading and description */}
          {loading ? (
            <Loading />
          ) : (
            <>
              {recommendedProperties.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedProperties.map((property) => (
                      <div key={property.id} className="relative">
                        {/* Recommendation Badge */}
                        <div className={`absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-semibold text-white ${
                          property.recommendation_type === 'most_booked' ? 'bg-blue-500' :
                          property.recommendation_type === 'highest_rated' ? 'bg-green-500' :
                          property.recommendation_type === 'user_search_based' ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`}>
                          {property.recommendation_label}
                        </div>
                        
                        {/* Property Card */}
                        <PropertyCard 
                          property={property} 
                          onFavoriteToggle={loadRecommendedProperties}
                        />
                        
                        {/* Recommendation Message */}
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 text-center">
                          {property.recommendation_message}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Recommendation Criteria Legend */}
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">How we recommend:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span><strong>Most Booked:</strong> Popular & trusted options</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span><strong>Highest Rated:</strong> Top-rated by guests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span><strong>For You:</strong> Based on your search history</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span><strong>Best Value:</strong> Around average market price</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recommended Properties Available</h3>
                  <p className="text-gray-600 mb-4">
                    We're loading personalized recommendations for you. Please check back in a moment.
                  </p>
                  <Loading />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-primary-100">Properties Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-primary-100">Verified Owners</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2000+</div>
              <div className="text-primary-100">Happy Renters</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-primary-100">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Home?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of renters who found their perfect property with us
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/properties">
              <Button size="lg">Browse Properties</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">List Your Property</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
};

export default Home;
