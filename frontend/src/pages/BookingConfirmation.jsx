import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle, Clock, AlertCircle, Home, Calendar, 
  DollarSign, User, Phone, Mail, ArrowRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import { bookingService } from '../services/bookingService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending_review');

  useEffect(() => {
    const bookingId = location.state?.bookingId;
    const initialStatus = location.state?.status;
    
    if (!bookingId) {
      navigate('/');
      return;
    }
    
    setStatus(initialStatus || 'pending_review');
    loadBookingDetails(bookingId);
  }, [location.state, navigate]);

  const loadBookingDetails = async (bookingId) => {
    try {
      const data = await bookingService.getBooking(bookingId);
      setBooking(data);
    } catch (error) {
      console.error('Error loading booking details:', error);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (bookingStatus) => {
    const variants = {
      pending_review: 'warning',
      confirmed: 'success',
      cancelled: 'error',
      rejected: 'error'
    };
    const icons = {
      pending_review: <Clock className="w-3 h-3" />,
      confirmed: <CheckCircle className="w-3 h-3" />,
      cancelled: <AlertCircle className="w-3 h-3" />,
      rejected: <AlertCircle className="w-3 h-3" />
    };
    
    return (
      <Badge variant={variants[bookingStatus] || 'default'} className="flex items-center gap-1">
        {icons[bookingStatus]}
        {bookingStatus === 'pending_review' ? 'Pending Review' : 
         bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1)}
      </Badge>
    );
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'pending_review':
        return {
          title: 'Payment Under Review',
          message: 'Your transaction receipt has been submitted. The property owner is reviewing your payment. You will receive a confirmation once the payment is verified.',
          color: 'yellow',
          icon: <Clock className="w-8 h-8" />
        };
      case 'confirmed':
        return {
          title: 'Booking Confirmed!',
          message: 'Your payment has been verified and your booking is confirmed. The property owner will contact you with further details.',
          color: 'green',
          icon: <CheckCircle className="w-8 h-8" />
        };
      case 'cancelled':
        return {
          title: 'Booking Cancelled',
          message: 'Your booking has been cancelled. If you believe this is an error, please contact support.',
          color: 'red',
          icon: <AlertCircle className="w-8 h-8" />
        };
      case 'rejected':
        return {
          title: 'Payment Rejected',
          message: 'The property owner could not verify your transaction. Please contact support if you believe this is an error.',
          color: 'red',
          icon: <AlertCircle className="w-8 h-8" />
        };
      default:
        return {
          title: 'Processing...',
          message: 'Your booking is being processed.',
          color: 'blue',
          icon: <Clock className="w-8 h-8" />
        };
    }
  };

  if (loading) return <Loading />;
  if (!booking) return <div className="text-center py-8">Booking not found</div>;

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Status Card */}
        <Card className={`mb-8 border-2 ${
          statusInfo.color === 'green' ? 'border-green-200 bg-green-50' :
          statusInfo.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
          statusInfo.color === 'red' ? 'border-red-200 bg-red-50' :
          'border-blue-200 bg-blue-50'
        }`}>
          <div className="text-center py-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              statusInfo.color === 'green' ? 'bg-green-100 text-green-600' :
              statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
              statusInfo.color === 'red' ? 'bg-red-100 text-red-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {statusInfo.icon}
            </div>
            
            <h1 className="text-2xl font-bold mb-2">{statusInfo.title}</h1>
            <p className="text-gray-600 max-w-md mx-auto">{statusInfo.message}</p>
            
            <div className="mt-4">
              {getStatusBadge(booking.status || status)}
            </div>
          </div>
        </Card>

        {/* Booking Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property & Booking Info */}
          <Card>
            <h2 className="text-xl font-semibold mb-6">Booking Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">{booking.property_details?.title}</p>
                  <p className="text-sm text-gray-600">{booking.property_details?.address}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">Move-in Date</p>
                  <p className="text-sm text-gray-600">{formatDate(booking.start_date)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">Number of Occupants</p>
                  <p className="text-sm text-gray-600">{booking.member_count} people</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">Payment Details</p>
                  <p className="text-sm text-gray-600">
                    Deposit: {formatCurrency(booking.deposit_amount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Method: Bakong KHQR
                  </p>
                </div>
              </div>
              
              {booking.notes && (
                <div>
                  <p className="font-medium mb-2">Special Requests</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded p-3">{booking.notes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Transaction & Contact Info */}
          <Card>
            <h2 className="text-xl font-semibold mb-6">Transaction Information</h2>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-2">Transaction Status</p>
                {getStatusBadge(booking.status || status)}
              </div>
              
              <div>
                <p className="font-medium mb-2">Submitted On</p>
                <p className="text-sm text-gray-600">{formatDate(booking.created_at)}</p>
              </div>
              
              {booking.transaction_image && (
                <div>
                  <p className="font-medium mb-2">Transaction Receipt</p>
                  <div className="border border-gray-200 rounded-lg p-2">
                    <img 
                      src={booking.transaction_image} 
                      alt="Transaction receipt" 
                      className="w-full h-48 object-contain"
                    />
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4">
                <p className="font-medium mb-3">What happens next?</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5"></div>
                    <p>Property owner reviews your transaction receipt</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5"></div>
                    <p>Payment verification process (usually within 24 hours)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5"></div>
                    <p>Please wait until the property owner has completed the check.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5"></div>
                    <p>Booking confirmation or rejection notification</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
          
          <Button
            onClick={() => navigate('/renter/dashboard')}
          >
            View My Bookings
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Support Section */}
        {status === 'pending_review' && (
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                If you haven't received a response within 24 hours, or if you have any questions about your booking, 
                please don't hesitate to contact our support team.
              </p>
              <Button variant="outline">
                Contact Support
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BookingConfirmation;
