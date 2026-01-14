import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { reviewService } from '../services/reviewService';
import { toast } from 'react-toastify';
import { Star, MessageCircle, Calendar, Filter, Search } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const ManageFeedback = () => {
  const { user } = useAuthStore();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      // Fetch all reviews for properties owned by current user
      const response = await reviewService.getReviews();
      const allReviews = response.results || response;
      
      // Filter reviews for user's properties
      const userPropertyFeedback = allReviews.filter(review => 
        review.property?.owner?.id === user.id
      );
      
      setFeedback(userPropertyFeedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'comments') return matchesSearch && item.overall_rating === 0;
    if (filter === 'ratings') return matchesSearch && item.overall_rating > 0;
    
    return matchesSearch;
  });

  const getPropertyFeedback = (propertyId) => {
    return feedback.filter(item => item.property?.id === propertyId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading feedback...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 lg:p-8">
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Feedback</h1>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage all comments and ratings for your properties
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Feedback</option>
                  <option value="comments">Comments Only</option>
                  <option value="ratings">Ratings Only</option>
                </select>
              </div>
            </div>

            {filteredFeedback.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No feedback found</h3>
                <p className="mt-2 text-gray-500">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No one has left feedback for your properties yet'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(
                  filteredFeedback.reduce((acc, item) => {
                    const propertyId = item.property?.id;
                    if (!acc[propertyId]) {
                      acc[propertyId] = [];
                    }
                    acc[propertyId].push(item);
                    return acc;
                  }, {})
                ).map(([propertyId, items]) => {
                  const property = items[0]?.property;
                  const propertyFeedback = getPropertyFeedback(propertyId);
                  
                  return (
                    <div key={propertyId} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {property?.title || 'Unknown Property'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {property?.address}, {property?.city}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{items.length} feedback item{items.length !== 1 ? 's' : ''}</span>
                          <span>Last updated: {formatDate(Math.max(...items.map(i => new Date(i.created_at))))}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {items.map((item, index) => (
                          <div key={item.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                {item.reviewer?.profile_picture ? (
                                  <img
                                    src={item.reviewer.profile_picture}
                                    alt={item.reviewer.full_name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-semibold text-gray-600">
                                    {item.reviewer?.full_name?.[0] || 'U'}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">
                                    {item.reviewer?.full_name || 'Anonymous'}
                                  </span>
                                  
                                  {item.overall_rating > 0 && (
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < item.overall_rating
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'fill-gray-200 text-gray-300'
                                          }`}
                                        />
                                      ))}
                                      <span className="ml-1 text-sm text-gray-600">
                                        ({item.overall_rating}/5)
                                      </span>
                                    </div>
                                  )}
                                  
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    item.overall_rating > 0 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {item.overall_rating > 0 ? 'Rating' : 'Comment'}
                                  </span>
                                </div>
                                
                                <p className="text-gray-700 text-sm mb-2">
                                  {item.comment}
                                </p>
                                
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(item.created_at)}
                                  </span>
                                  {item.is_verified && (
                                    <span className="flex items-center gap-1 text-green-600">
                                      <Star className="w-3 h-3" />
                                      Verified Tenant
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageFeedback;
