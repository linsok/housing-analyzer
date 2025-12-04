import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaTrash, FaPlus, FaEye, FaSearch } from 'react-icons/fa';

const OwnerProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadProperties();
  }, []);

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
                        <div className="flex items-center text-sm text-gray-500">
                          <span>Created: {new Date(property.created_at).toLocaleDateString()}</span>
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
    </div>
  );
};

export default OwnerProperties;
