import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CreditCard, QrCode, Upload, AlertCircle, CheckCircle, 
  XCircle, ArrowLeft, ArrowRight, Loader2, Download, Eye
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import { propertyService } from '../services/propertyService';
import { bookingService } from '../services/bookingService';
import { formatCurrency } from '../utils/formatters';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [property, setProperty] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionImage, setTransactionImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Get booking data from sessionStorage
  useEffect(() => {
    const savedBookingData = sessionStorage.getItem('bookingData');
    if (!savedBookingData) {
      navigate(`/properties/${id}`);
      return;
    }
    
    const booking = JSON.parse(savedBookingData);
    setBookingData(booking);
    loadProperty(booking.propertyId);
  }, [id, navigate]);

  const loadProperty = async (propertyId) => {
    try {
      const data = await propertyService.getProperty(propertyId);
      setProperty(data);
    } catch (error) {
      console.error('Error loading property:', error);
      toast.error('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    if (method === 'aba_qr') {
      setCurrentStep(2);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setTransactionImage(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!transactionImage) {
      toast.error('Please upload your transaction receipt');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('property_id', bookingData.propertyId);
      formData.append('renter_id', user.id);
      formData.append('payment_method', 'aba_qr');
      formData.append('transaction_image', transactionImage);
      formData.append('amount', bookingData.depositAmount);
      
      // Add booking details
      Object.keys(bookingData).forEach(key => {
        if (key !== 'bookingId' && key !== 'propertyId' && key !== 'depositAmount') {
          let value = bookingData[key];
          
          // Convert memberCount from string to number
          if (key === 'memberCount' && value === '6+') {
            value = 6; // Convert '6+' to 6 for the backend
          } else if (key === 'memberCount') {
            value = parseInt(value, 10); // Convert other numeric values
          }
          
          formData.append(key, value);
        }
      });

      // DEBUG: Log the payload
      console.log('=== PAYMENT SUBMISSION DEBUG ===');
      console.log('User:', user);
      console.log('Booking Data:', bookingData);
      console.log('Transaction Image:', transactionImage);
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // Submit payment with transaction proof
      const response = await bookingService.submitPaymentWithTransaction(formData);
      
      toast.success('Transaction submitted successfully! The property owner will review your payment.');
      
      // Clear sessionStorage
      sessionStorage.removeItem('bookingData');
      
      // Redirect to booking confirmation page
      navigate('/booking-confirmation', { 
        state: { 
          bookingId: response.id,
          status: 'pending_review'
        } 
      });
      
    } catch (error) {
      console.error('=== PAYMENT ERROR DEBUG ===');
      console.error('Error submitting payment:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to submit payment. Please try again.';
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getQrCodeImage = () => {
    if (!property?.images) return null;
    
    // Find QR code image from property images
    const qrImage = property.images.find(img => img.is_qr_code);
    return qrImage?.image;
  };

  if (loading) return <Loading />;
  if (!property || !bookingData) return <div className="text-center py-8">Property not found</div>;

  const qrCodeImage = getQrCodeImage();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(`/properties/${id}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Property
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
          <p className="text-gray-600 mt-2">Property: {property.title}</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Select Payment Method</span>
            </div>
            
            <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Upload Transaction</span>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Property:</span>
              <span className="font-medium">{property.title}</span>
            </div>
            <div className="flex justify-between">
              <span>Move-in Date:</span>
              <span className="font-medium">{bookingData.preferredDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Contact Phone:</span>
              <span className="font-medium">{bookingData.phone}</span>
            </div>
            <div className="flex justify-between">
              <span>Number of Occupants:</span>
              <span className="font-medium">{bookingData.memberCount}</span>
            </div>
            {bookingData.notes && (
              <div>
                <span>Special Requests:</span>
                <p className="text-sm text-gray-600 mt-1">{bookingData.notes}</p>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold text-lg">
                <span>Required Deposit (50%):</span>
                <span className="text-primary-600">{formatCurrency(bookingData.depositAmount)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 1: Payment Method Selection */}
        {currentStep === 1 && (
          <Card>
            <h2 className="text-xl font-semibold mb-6">Select Payment Method</h2>
            
            <div className="space-y-4">
              <div
                onClick={() => handlePaymentMethodSelect('aba_qr')}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  paymentMethod === 'aba_qr' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <QrCode className="w-8 h-8 text-primary-600 mr-4" />
                  <div>
                    <h3 className="font-semibold text-lg">ABA Mobile QR Code</h3>
                    <p className="text-gray-600">Pay using ABA Mobile app by scanning the QR code</p>
                  </div>
                </div>
              </div>

              {/* Note about payment processing */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Important:</strong> After payment, you'll need to upload a screenshot of your transaction receipt. 
                      The property owner will review and verify your payment before confirming the booking.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: QR Code Payment and Transaction Upload */}
        {currentStep === 2 && paymentMethod === 'aba_qr' && (
          <div className="space-y-6">
            {/* QR Code Display */}
            {qrCodeImage ? (
              <Card>
                <h2 className="text-xl font-semibold mb-6">Scan QR Code to Pay</h2>
                
                <div className="text-center">
                  <div className="inline-block p-4 bg-white rounded-lg border border-gray-200 mb-4">
                    <img 
                      src={qrCodeImage} 
                      alt="ABA Payment QR Code" 
                      className="w-64 h-64 object-contain mx-auto"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                        <p className="text-sm text-yellow-800">
                          Please pay exactly <strong>{formatCurrency(bookingData.depositAmount)}</strong>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = qrCodeImage;
                          link.download = 'aba-qr-code.png';
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download QR Code
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">QR Code Not Available</h3>
                  <p className="text-gray-600">The property owner hasn't uploaded their payment QR code yet.</p>
                </div>
              </Card>
            )}

            {/* Transaction Upload */}
            <Card>
              <h2 className="text-xl font-semibold mb-6">Upload Transaction Receipt</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Screenshot <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {transactionImage ? (
                      <div className="space-y-4">
                        <div className="relative inline-block">
                          <img 
                            src={URL.createObjectURL(transactionImage)} 
                            alt="Transaction receipt" 
                            className="max-w-full h-48 object-contain rounded"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTransactionImage(null)}
                            className="absolute top-2 right-2 bg-white"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">{transactionImage.name}</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="transaction-upload"
                        />
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => document.getElementById('transaction-upload').click()}
                        >
                          Select File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Please ensure your screenshot shows:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Complete transaction details</li>
                    <li>• Amount paid: {formatCurrency(bookingData.depositAmount)}</li>
                    <li>• Transaction date and time</li>
                    <li>• Sender and recipient information</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  
                  <Button
                    onClick={handleSubmitPayment}
                    disabled={!transactionImage || isSubmitting}
                    className="min-w-[200px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Transaction
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
