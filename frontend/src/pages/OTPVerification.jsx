import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, CheckCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { authService } from '../services/authService';

const OTPVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (otpCode.length !== 6) {
      setError('Please enter a 6-digit OTP code');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.verifyOTP(email, otpCode);
      setSuccess(true);
      setVerifiedEmail(response.email);
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setError('');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">OTP Verified</h2>
            <p className="mt-2 text-gray-600">
              Your OTP has been verified successfully.
            </p>
          </div>

          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                You can now reset your password.
              </p>
              <Button
                onClick={() => navigate(`/reset-password?email=${verifiedEmail}`)}
                className="w-full"
              >
                Reset Password
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <Shield className="w-10 h-10 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">My Rentor</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Enter OTP</h2>
          <p className="mt-2 text-gray-600">
            We've sent a 6-digit code to your email
          </p>
          <p className="text-sm text-gray-500 mt-1">{email}</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="OTP Code"
              type="text"
              name="otpCode"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              autoComplete="one-time-code"
              placeholder="Enter 6-digit code"
              maxLength={6}
              pattern="[0-9]{6}"
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading || otpCode.length !== 6}
            >
              {loading ? (
                'Verifying...'
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Verify OTP
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={loading}
              className="text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50"
            >
              Resend OTP
            </button>
            
            <div className="mt-4">
              <Link
                to="/forgot-password"
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Forgot Password
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OTPVerification;
