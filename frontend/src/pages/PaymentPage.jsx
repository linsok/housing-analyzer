import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CreditCard, QrCode, Upload, AlertCircle, CheckCircle, 
  XCircle, ArrowLeft, ArrowRight, Loader2, Download, Eye,
  Smartphone, RefreshCw, Clock
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import { propertyService } from '../services/propertyService';
import { bookingService } from '../services/bookingService';
import bakongService from '../services/bakongService';
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
  const [khqrData, setKhqrData] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentPolling, setPaymentPolling] = useState(null);
  const [transactionUploadFile, setTransactionUploadFile] = useState(null);
  const [uploadingTransaction, setUploadingTransaction] = useState(false);
  const [showTransactionUpload, setShowTransactionUpload] = useState(false);
  
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

  const handlePaymentMethodSelect = async (method) => {
    setPaymentMethod(method);
    if (method === 'bakong_khqr') {
      setCurrentStep(2);
      await generateKHQRCode();
    }
  };

  const generateKHQRCode = async () => {
    setGeneratingQR(true);
    try {
      const khqrResponse = await bakongService.generateKHQR({
        amount: bookingData.depositAmount,
        currency: property.currency || 'KHR', // Use property currency
        property_title: property.title,
        booking_id: bookingData.bookingId || 'BK' + Date.now(),
        renter_name: user.name || user.email,
        property_id: property.id
      });
      
      setKhqrData(khqrResponse);
      toast.success('KHQR code generated successfully!');
    } catch (error) {
      console.error('Error generating KHQR:', error);
      toast.error(error.error || 'Failed to generate payment QR code');
    } finally {
      setGeneratingQR(false);
    }
  };

  const startPaymentVerification = () => {
    if (!khqrData?.md5_hash) return;
    
    setVerifyingPayment(true);
    setPaymentStatus({ status: 'verifying', message: 'Waiting for payment...' });
    
    const polling = bakongService.startPaymentVerification(
      khqrData.md5_hash,
      (status) => {
        setPaymentStatus(status);
        
        if (status.status === 'PAID') {
          handlePaymentSuccessful();
        } else if (status.status === 'timeout' || status.status === 'error') {
          setVerifyingPayment(false);
          if (paymentPolling) {
            paymentPolling.stop();
          }
        }
      }
    );
    
    setPaymentPolling(polling);
  };

  const handlePaymentSuccessful = async () => {
    setVerifyingPayment(false);
    if (paymentPolling) {
      paymentPolling.stop();
    }
    
    setShowTransactionUpload(true);
    toast.success('Payment confirmed! Please upload your transaction receipt.');
  };

  const handleTransactionFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload an image (JPEG, PNG, GIF) or PDF file');
        return;
      }
      
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setTransactionUploadFile(file);
    }
  };

  const handleTransactionUpload = async () => {
    if (!transactionUploadFile) {
      toast.error('Please select a transaction receipt file');
      return;
    }

    setUploadingTransaction(true);
    
    try {
      // Submit booking with Bakong payment confirmation and transaction upload
      const formData = new FormData();
      formData.append('property_id', bookingData.propertyId);
      formData.append('renter_id', user.id);
      formData.append('payment_method', 'bakong_khqr');
      formData.append('amount', bookingData.depositAmount);
      formData.append('bakong_md5_hash', khqrData.md5_hash);
      formData.append('payment_status', 'completed');
      formData.append('transaction_image', transactionUploadFile);
      
      // Add booking details
      Object.keys(bookingData).forEach(key => {
        if (key !== 'bookingId' && key !== 'propertyId' && key !== 'depositAmount') {
          let value = bookingData[key];
          
          if (key === 'memberCount' && value === '6+') {
            value = 6;
          } else if (key === 'memberCount') {
            value = parseInt(value, 10);
          }
          
          formData.append(key, value);
        }
      });

      const response = await bookingService.submitPaymentWithTransaction(formData);
      
      toast.success('Transaction receipt uploaded successfully! Your booking has been submitted.');
      sessionStorage.removeItem('bookingData');
      
      navigate('/booking-confirmation', { 
        state: { 
          bookingId: response.id,
          status: 'confirmed'
        } 
      });
      
    } catch (error) {
      console.error('Error uploading transaction:', error);
      toast.error('Failed to upload transaction receipt. Please try again.');
    } finally {
      setUploadingTransaction(false);
    }
  };

  const stopPaymentVerification = () => {
    if (paymentPolling) {
      paymentPolling.stop();
      setPaymentPolling(null);
    }
    setVerifyingPayment(false);
    setPaymentStatus(null);
  };

  if (loading) return <Loading />;
  if (!property || !bookingData) return <div className="text-center py-8">Property not found</div>;

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
              <span className="ml-2 font-medium">Complete Payment</span>
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
                onClick={() => handlePaymentMethodSelect('bakong_khqr')}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  paymentMethod === 'bakong_khqr' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Smartphone className="w-8 h-8 text-primary-600 mr-4" />
                  <div>
                    <h3 className="font-semibold text-lg">Bakong KHQR Payment</h3>
                    <p className="text-gray-600">Pay using Bakong app by scanning the KHQR code</p>
                  </div>
                </div>
              </div>

              {/* Note about Bakong payment */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Instant Payment:</strong> Bakong KHQR provides instant payment verification. 
                      Your booking will be confirmed immediately after payment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Bakong KHQR Payment */}
        {currentStep === 2 && paymentMethod === 'bakong_khqr' && (
          <div className="space-y-6">
            {/* KHQR Code Display */}
            {khqrData ? (
              <Card>
                <h2 className="text-xl font-semibold mb-6">Scan KHQR Code to Pay</h2>
                
                <div className="text-center">
                  <div className="inline-block p-4 bg-white rounded-lg border border-gray-200 mb-4">
                    <img 
                      src={khqrData.qr_image} 
                      alt="Bakong KHQR Payment Code" 
                      className="w-64 h-64 object-contain mx-auto"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-green-600 mr-2" />
                        <p className="text-sm text-green-800">
                          Pay exactly <strong>{formatCurrency(bookingData.depositAmount)}</strong>
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-blue-600 mr-2" />
                        <p className="text-sm text-blue-800">
                          <strong>Merchant:</strong> {khqrData.merchant_name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = khqrData.qr_image;
                          link.download = 'bakong-khqr-code.png';
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download KHQR
                      </Button>
                      
                      </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-8">
                  {generatingQR ? (
                    <>
                      <Loader2 className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-spin" />
                      <h3 className="text-lg font-semibold mb-2">Generating KHQR Code...</h3>
                      <p className="text-gray-600">Please wait while we generate your payment QR code.</p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">KHQR Code Not Available</h3>
                      <p className="text-gray-600">Failed to generate payment QR code.</p>
                      <Button 
                        className="mt-4"
                        onClick={generateKHQRCode}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            )}

            {/* Payment Status and Verification */}
            {khqrData && (
              <Card>
                <h2 className="text-xl font-semibold mb-6">Payment Status</h2>
                
                <div className="space-y-4">
                  {verifyingPayment ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <div className="flex items-center justify-center mb-4">
                        <Loader2 className="w-8 h-8 text-yellow-600 animate-spin mr-3" />
                        <div>
                          <h3 className="font-semibold text-yellow-800">Verifying Payment...</h3>
                          <p className="text-sm text-yellow-700 mt-1">
                            {paymentStatus?.message || 'Please complete the payment in your Bakong app'}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          onClick={stopPaymentVerification}
                          className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                        >
                          Stop Verification
                        </Button>
                      </div>
                    </div>
                  ) : paymentStatus?.status === 'PAID' ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                        <div>
                          <h3 className="font-semibold text-green-800">Payment Successful!</h3>
                          <p className="text-sm text-green-700 mt-1">
                            Your payment has been confirmed. Please upload your transaction receipt to complete the booking.
                          </p>
                        </div>
                      </div>
                      
                      {showTransactionUpload && (
                        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="font-semibold text-gray-800 mb-4">Upload Transaction Receipt</h4>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Transaction Receipt (Required)
                              </label>
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                <input
                                  type="file"
                                  id="transaction-upload"
                                  className="hidden"
                                  accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf"
                                  onChange={handleTransactionFileChange}
                                  disabled={uploadingTransaction}
                                />
                                <label
                                  htmlFor="transaction-upload"
                                  className="cursor-pointer"
                                >
                                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                  <p className="text-sm text-gray-600 mb-2">
                                    Click to upload or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    JPEG, PNG, GIF, or PDF (MAX. 5MB)
                                  </p>
                                </label>
                              </div>
                              
                              {transactionUploadFile && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <Upload className="w-4 h-4 text-green-600 mr-2" />
                                      <span className="text-sm text-gray-700">{transactionUploadFile.name}</span>
                                    </div>
                                    <button
                                      onClick={() => setTransactionUploadFile(null)}
                                      className="text-red-500 hover:text-red-700"
                                      disabled={uploadingTransaction}
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex justify-center">
                              <Button
                                onClick={handleTransactionUpload}
                                disabled={!transactionUploadFile || uploadingTransaction}
                                className="w-full"
                              >
                                {uploadingTransaction ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Transaction
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : paymentStatus?.status === 'timeout' || paymentStatus?.status === 'error' ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <div className="flex items-center justify-center">
                        <XCircle className="w-8 h-8 text-red-600 mr-3" />
                        <div>
                          <h3 className="font-semibold text-red-800">Payment Verification Failed</h3>
                          <p className="text-sm text-red-700 mt-1">
                            {paymentStatus?.message || 'Could not verify payment. Please try again.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-center mt-4">
                        <Button
                          onClick={startPaymentVerification}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Retry Verification
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="text-center">
                        <Clock className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-800 mb-2">Ready for Payment</h3>
                        <p className="text-sm text-gray-700 mb-4">
                          Scan the KHQR code above with your Bakong app to complete the payment.
                        </p>
                        <Button
                          onClick={startPaymentVerification}
                          className="w-full"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Start Payment Verification
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep(1);
                  setKhqrData(null);
                  setPaymentStatus(null);
                  stopPaymentVerification();
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
