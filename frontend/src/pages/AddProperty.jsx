import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Home, Upload, DollarSign, MapPin, Bed, Bath, Square, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { propertyService } from '../services/propertyService';

const AddProperty = (props) => {
  const navigate = useNavigate();
  const { id } = useParams();
  // Check if we're in edit mode based on URL or props
  const editMode = id ? true : (props.editMode || false);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'apartment',
    address: '',
    city: '',
    district: '',
    area: '',
    postal_code: '',
    rent_price: '',
    deposit: '',
    sale_price: '',
    listing_type: 'rent', // 'rent' or 'sale'
    bedrooms: 1,
    bathrooms: 1,
    area_sqm: '',
    floor_number: '',
    is_furnished: false,
    pets_allowed: false,
    smoking_allowed: false,
    facilities: [],
    rules: '',
    available_from: '',
  });

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'room', label: 'Room' },
    { value: 'studio', label: 'Studio' },
    { value: 'condo', label: 'Condo' },
  ];

  const facilityOptions = [
    'WiFi', 'Parking', 'Air Conditioning', 'Gym', 'Swimming Pool',
    'Security', 'Elevator', 'Balcony', 'Garden', 'Laundry',
    'Kitchen', 'Heating', 'TV', 'Refrigerator', 'Washing Machine'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFacilityToggle = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Fetch property details when in edit mode
  useEffect(() => {
    if (editMode && id) {
      const fetchProperty = async () => {
        try {
          setLoading(true);
          const property = await propertyService.getProperty(id);
          
          // Convert property data to match form structure
          const formattedData = {
            title: property.title || '',
            description: property.description || '',
            property_type: property.property_type || 'apartment',
            address: property.address || '',
            city: property.city || '',
            district: property.district || '',
            area: property.area || '',
            postal_code: property.postal_code || '',
            rent_price: property.rent_price || '',
            deposit: property.deposit || '',
            sale_price: property.sale_price || '',
            listing_type: property.listing_type || 'rent',
            bedrooms: property.bedrooms || 1,
            bathrooms: property.bathrooms || 1,
            area_sqm: property.area_sqm || '',
            floor_number: property.floor_number || '',
            is_furnished: property.is_furnished || false,
            pets_allowed: property.pets_allowed || false,
            smoking_allowed: property.smoking_allowed || false,
            facilities: property.facilities ? JSON.parse(property.facilities) : [],
            rules: property.rules || '',
            available_from: property.available_from || '',
          };

          setFormData(formattedData);
          
          // Handle existing images
          if (property.images && property.images.length > 0) {
            setExistingImages(property.images);
          }
          
        } catch (error) {
          console.error('Error submitting form:', error);
          const errorMessage = error.response?.data?.message || 'Failed to save property. Please try again.';
          toast.error(errorMessage);
          navigate('/owner/properties');
        } finally {
          setLoading(false);
        }
      };

      fetchProperty();
    }
  }, [editMode, id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editMode && images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    // Check required fields
    const requiredFields = ['title', 'description', 'property_type', 'address', 'city', 'rent_price'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      // Create FormData for the property data
      const formDataToSend = new FormData();
      
      // Prepare property data with defaults
      const propertyData = {
        title: formData.title,
        description: formData.description,
        property_type: formData.property_type,
        address: formData.address,
        city: formData.city,
        district: formData.district || '',
        area: formData.area || '',
        postal_code: formData.postal_code || '',
        rent_price: parseFloat(formData.rent_price) || 0,
        deposit: parseFloat(formData.deposit) || 0,
        bedrooms: parseInt(formData.bedrooms) || 1,
        bathrooms: parseInt(formData.bathrooms) || 1,
        area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
        floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
        is_furnished: Boolean(formData.is_furnished),
        pets_allowed: Boolean(formData.pets_allowed),
        smoking_allowed: Boolean(formData.smoking_allowed),
        facilities: JSON.stringify(formData.facilities || []),
        rules: formData.rules || '',
        available_from: formData.available_from || null,
        status: 'available',
        verification_status: 'pending'
      };

      // Add all fields to formDataToSend
      Object.entries(propertyData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });

      // Add images to FormData (only for new uploads)
      images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      // If in edit mode, include existing image IDs to keep them
      if (editMode && existingImages.length > 0) {
        existingImages.forEach(image => {
          formDataToSend.append('existing_images', image.id);
        });
      }

      // Log the data being sent (for debugging)
      console.log('Submitting property data:', Object.fromEntries(formDataToSend.entries()));

      // Submit the form
      let response;
      if (editMode) {
        response = await propertyService.updateProperty(id, formDataToSend);
        toast.success('Property updated successfully!');
      } else {
        response = await propertyService.createProperty(formDataToSend);
        toast.success('Property added successfully!');
      }
      
      // Redirect to properties list
      navigate('/owner/properties');
    } catch (error) {
      console.error('Error creating property:', {
        error: error,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'An error occurred while saving the property';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && editMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Home className="w-8 h-8 text-primary-600" />
            {editMode ? 'Edit Property' : 'Add New Property'}
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to list your property. It will be reviewed by admin before being published.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Modern 2BR Apartment in City Center"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe your property in detail..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type *
                  </label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Listing Type *
                  </label>
                  <select
                    name="listing_type"
                    value={formData.listing_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="rent">For Rent</option>
                    <option value="sale">For Sale</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area/Neighborhood
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing
            </h2>
            <div className="space-y-4">
              {formData.listing_type === 'rent' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Rent (USD) *
                      </label>
                      <input
                        type="number"
                        name="rent_price"
                        value={formData.rent_price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="1000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Security Deposit (USD)
                      </label>
                      <input
                        type="number"
                        name="deposit"
                        value={formData.deposit}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="1000"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sale Price (USD) *
                  </label>
                  <input
                    type="number"
                    name="sale_price"
                    value={formData.sale_price}
                    onChange={handleInputChange}
                    required={formData.listing_type === 'sale'}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="250000"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Property Details */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Bed className="w-4 h-4 inline mr-1" />
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Bath className="w-4 h-4 inline mr-1" />
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Square className="w-4 h-4 inline mr-1" />
                    Area (sqm)
                  </label>
                  <input
                    type="number"
                    name="area_sqm"
                    value={formData.area_sqm}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Number
                  </label>
                  <input
                    type="number"
                    name="floor_number"
                    value={formData.floor_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available From
                </label>
                <input
                  type="date"
                  name="available_from"
                  value={formData.available_from}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_furnished"
                    checked={formData.is_furnished}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Furnished</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="pets_allowed"
                    checked={formData.pets_allowed}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Pets Allowed</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="smoking_allowed"
                    checked={formData.smoking_allowed}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Smoking Allowed</span>
                </label>
              </div>
            </div>
          </Card>

          {/* Facilities */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Facilities & Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {facilityOptions.map(facility => (
                <label
                  key={facility}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.facilities.includes(facility)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.facilities.includes(facility)}
                    onChange={() => handleFacilityToggle(facility)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{facility}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Rules */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">House Rules</h2>
            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., No parties, Quiet hours after 10 PM, etc."
            />
          </Card>

          {/* Images */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Property Images *
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload up to 10 images (First image will be the primary image)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {existingImages.map((image, index) => (
                <div key={`existing-${index}`} className="relative group">
                  <img 
                    src={image.image} 
                    alt={`Existing ${index + 1}`} 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== index))}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Submit */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Review Process</h3>
                <p className="text-sm text-blue-700">
                  Your property will be submitted for admin review. Once approved, it will be visible to potential renters.
                  You'll be notified of the approval status.
                </p>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/owner/dashboard')}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Property for Review'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
