import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaTrash, FaPlus, FaEye, FaSearch, FaTimes, FaHeart, FaPlay, FaPause } from 'react-icons/fa';
import { useAuthStore } from '../store/useAuthStore';

const OwnerProperties = () => {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewProperty, setViewProperty] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadProperties();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Get current user profile
      const response = await fetch('/api/auth/users/profile/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load profile');
      }
      
      const data = await response.json();
      console.log('User profile loaded:', data); // Debug log
      setUserProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Set userProfile to null to ensure verification check fails
      setUserProfile(null);
    }
  };

  // Debug: Log property data when it changes
  useEffect(() => {
    if (properties.length > 0) {
      console.log('Properties loaded:', properties);
    }
  }, [properties]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyService.getMyProperties();
      // Handle both array and object with results property
      const propertiesData = Array.isArray(response) ? response : (response.results || []);
      setProperties(propertiesData);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Failed to load properties');
      setProperties([]); // Ensure properties is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000); // Reset after 3 seconds
      return;
    }

    try {
      await propertyService.deleteProperty(id);
      setProperties(properties.filter(property => property.id !== id));
      toast.success('Property deleted successfully');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  const handleViewProperty = (property) => {
    setViewProperty(property);
  };

  const handleFavoriteToggle = async (propertyId) => {
    try {
      const response = await propertyService.toggleFavorite(propertyId);
      // Update the property in the list to reflect the new favorite status
      setProperties(properties.map(property => 
        property.id === propertyId 
          ? { ...property, is_favorited: response.is_favorited, favorite_count: response.favorite_count || property.favorite_count }
          : property
      ));
      toast.success(response.is_favorited ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to toggle favorite');
    }
  };

  const handlePublishProperty = async (propertyId) => {
    // Check if user profile is verified
    console.log('Publish check - User profile:', userProfile);
    console.log('Publish check - User verification status:', userProfile?.verification_status);
    
    if (!userProfile) {
      toast.error('Please complete your profile setup before publishing properties.');
      return;
    }
    
    if (userProfile.verification_status !== 'verified') {
      toast.error(`Your profile verification status is "${userProfile.verification_status}". Only verified profiles can publish properties. Please complete your profile verification.`);
      return;
    }

    // Check property verification
    const property = properties.find(p => p.id === propertyId);
    console.log('Publish check - Property:', property);
    console.log('Publish check - Property verification status:', property?.verification_status);
    
    if (property.verification_status !== 'verified') {
      toast.error(`Property verification status is "${property.verification_status}". Only verified properties can be published.`);
      return;
    }

    try {
      const response = await propertyService.updatePropertyStatus(propertyId, 'available');
      // Update the property in the list
      setProperties(properties.map(property => 
        property.id === propertyId 
          ? { ...property, status: 'available' }
          : property
      ));
      toast.success('Property published successfully!');
    } catch (error) {
      console.error('Error publishing property:', error);
      toast.error('Failed to publish property');
    }
  };

  const handleUnpublishProperty = async (propertyId) => {
    try {
      const response = await propertyService.updatePropertyStatus(propertyId, 'draft');
      // Update the property in the list
      setProperties(properties.map(property => 
        property.id === propertyId 
          ? { ...property, status: 'draft' }
          : property
      ));
      toast.success('Property unpublished successfully!');
    } catch (error) {
      console.error('Error unpublishing property:', error);
      toast.error('Failed to unpublish property');
    }
  };

  const formatCambodiaTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Phnom_Penh'
    });
  };

  const canPublishProperty = (property) => {
    return userProfile && 
           userProfile.verification_status === 'verified' && 
           property.verification_status === 'verified';
  };

  const filteredProperties = Array.isArray(properties) 
    ? properties.filter(property => 
        (property.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (property.city?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (property.status?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    : [];

  const getStatusBadge = (status) => {
    const statusClasses = {
      available: 'bg-green-100 text-green-800',
      rented: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-blue-100 text-blue-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getVerificationBadge = (verificationStatus) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[verificationStatus] || 'bg-gray-100 text-gray-800'}`}>
        Verification: {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
      </span>
    );
  };

  const canEditProperty = (verificationStatus) => {
    return verificationStatus === 'pending' || verificationStatus === 'rejected';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white rounded-lg shadow p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <Link
            to="/owner/properties/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaPlus className="mr-2" />
            Add Property
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new property.
              </p>
              <div className="mt-6">
                <Link
                  to="/add-property"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                  New Property
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredProperties.map((property) => (
                  <li key={property.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {property.title}
                            </p>
                            <div className="ml-2 flex space-x-1">
                              {getStatusBadge(property.status)}
                              {getVerificationBadge(property.verification_status)}
                            </div>
                          </div>
                          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {property.city}, {property.area || 'N/A'}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {property.property_type}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {property.bedrooms} Beds • {property.bathrooms} Baths • {property.area_sqm} sqm
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex space-x-2">
                          {property.verification_status === 'verified' && (
                            <button
                              type="button"
                              onClick={() => handleViewProperty(property)}
                              className="p-2 rounded-full text-green-600 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              title="View property details"
                            >
                              <FaEye className="h-5 w-5" />
                            </button>
                          )}
                          {property.status === 'draft' && (
                            <button
                              type="button"
                              onClick={() => handlePublishProperty(property.id)}
                              disabled={!canPublishProperty(property)}
                              className={`p-2 rounded-full ${
                                canPublishProperty(property) 
                                  ? 'text-green-600 hover:text-green-700' 
                                  : 'text-gray-400 cursor-not-allowed'
                              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                              title={
                                canPublishProperty(property) 
                                  ? 'Publish property' 
                                  : !userProfile
                                    ? 'Profile setup required to publish'
                                    : userProfile.verification_status !== 'verified'
                                      ? `Profile verification required (Current: ${userProfile.verification_status})`
                                      : `Property verification required (Current: ${property.verification_status})`
                              }
                            >
                              <FaPlay className="h-5 w-5" />
                            </button>
                          )}
                          {canEditProperty(property.verification_status) ? (
                            <Link
                              to={`/edit-property/${property.id}`}
                              className="p-2 rounded-full text-indigo-600 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              title="Edit property"
                              onClick={() => console.log('Editing property:', property.id)}
                            >
                              <FaEdit className="h-5 w-5" />
                            </Link>
                          ) : (
                            <button
                              className="p-2 rounded-full text-gray-400 cursor-not-allowed"
                              title={`Cannot edit: Property is ${property.verification_status}`}
                              disabled
                            >
                              <FaEdit className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(property.id)}
                            className={`p-2 rounded-full ${deleteConfirm === property.id ? 'text-red-600' : 'text-gray-400 hover:text-red-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                            title={deleteConfirm === property.id ? 'Click again to confirm' : 'Delete'}
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <div className="sm:flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="font-medium text-gray-900">
                              ${property.rent_price.toLocaleString()}
                            </span>
                            <span className="ml-1">/month</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end text-sm text-gray-500">
                          <span>Created: {formatCambodiaTime(property.created_at)}</span>
                          <span className="text-xs text-gray-400">Cambodia Time</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Property View Modal */}
      {viewProperty && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
              <button
                onClick={() => setViewProperty(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Title</label>
                    <p className="text-gray-900">{viewProperty.title || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Property Type</label>
                    <p className="text-gray-900">{viewProperty.property_type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">{getStatusBadge(viewProperty.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Verification Status</label>
                    <div className="mt-1">{getVerificationBadge(viewProperty.verification_status)}</div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Location Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-gray-900">{viewProperty.address || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">City</label>
                    <p className="text-gray-900">{viewProperty.city || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Area/District</label>
                    <p className="text-gray-900">{viewProperty.area || viewProperty.district || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Province</label>
                    <p className="text-gray-900">{viewProperty.province || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Bedrooms</label>
                    <p className="text-gray-900">{viewProperty.bedrooms || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Bathrooms</label>
                    <p className="text-gray-900">{viewProperty.bathrooms || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Area Size</label>
                    <p className="text-gray-900">{viewProperty.area_sqm || 'N/A'} sqm</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Floor Number</label>
                    <p className="text-gray-900">{viewProperty.floor_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Rent Price</label>
                    <p className="text-gray-900">${viewProperty.rent_price?.toLocaleString() || 'N/A'}/month</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Deposit</label>
                    <p className="text-gray-900">${viewProperty.deposit?.toLocaleString() || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Amenities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Furnished</label>
                    <p className="text-gray-900">{viewProperty.is_furnished ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pets Allowed</label>
                    <p className="text-gray-900">{viewProperty.pets_allowed ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Parking Available</label>
                    <p className="text-gray-900">{viewProperty.parking_available ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Air Conditioning</label>
                    <p className="text-gray-900">{viewProperty.air_conditioning ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Swimming Pool</label>
                    <p className="text-gray-900">{viewProperty.swimming_pool ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Gym/Fitness</label>
                    <p className="text-gray-900">{viewProperty.gym ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Description</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{viewProperty.description || 'No description available'}</p>
              </div>

              {/* Property Images */}
              {viewProperty.images && viewProperty.images.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Property Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {viewProperty.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Property ID</label>
                    <p className="text-gray-900">{viewProperty.id || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created Date</label>
                    <p className="text-gray-900">{viewProperty.created_at ? new Date(viewProperty.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <p className="text-gray-900">{viewProperty.updated_at ? new Date(viewProperty.updated_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">View Count</label>
                    <p className="text-gray-900">{viewProperty.view_count || 0} views</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerProperties;
