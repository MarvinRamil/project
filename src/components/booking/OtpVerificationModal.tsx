import React, { useState, useEffect } from 'react';
import { X, Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otpCode: string) => Promise<boolean>;
  bookingId: number;
  bookingNumber?: string;
  guestEmail?: string;
}

const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  bookingId,
  bookingNumber,
  guestEmail
}) => {
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isVerified) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isVerified]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtpCode('');
      setError('');
      setIsVerified(false);
      setTimeLeft(300);
    }
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (!otpCode.trim()) {
      setError('Please enter the OTP code');
      return;
    }

    if (otpCode.length !== 6) {
      setError('OTP code must be 6 digits');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const success = await onVerify(otpCode);
      if (success) {
        setIsVerified(true);
        // Auto close after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('Invalid OTP code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtpCode(value);
      setError('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && otpCode.length === 6) {
      handleVerify();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Verify Your Booking</h2>
              <p className="text-sm text-gray-600">Enter the OTP sent to your email</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isVerified ? (
            // Success State
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Verified!</h3>
              <p className="text-gray-600 mb-4">
                Your booking has been successfully verified and confirmed.
              </p>
              {bookingNumber && (
                <p className="text-sm text-gray-500">
                  Booking Number: <span className="font-mono font-medium">{bookingNumber}</span>
                </p>
              )}
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✓ Booking status updated to <span className="font-semibold">Confirmed</span>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  You will be redirected to the confirmation page shortly...
                </p>
              </div>
            </div>
          ) : (
            // Verification Form
            <>
              {/* Booking Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Booking ID</span>
                  <span className="text-sm font-mono text-blue-700">#{bookingId}</span>
                </div>
                {bookingNumber && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Booking Number</span>
                    <span className="text-sm font-mono text-blue-700">{bookingNumber}</span>
                  </div>
                )}
                {guestEmail && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Email</span>
                    <span className="text-sm text-blue-700">{guestEmail}</span>
                  </div>
                )}
              </div>

              {/* Timer */}
              {timeLeft > 0 && (
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center space-x-2 text-orange-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      OTP expires in {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              )}

              {/* OTP Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-digit OTP Code
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={6}
                  disabled={isVerifying || timeLeft === 0}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 mb-4">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Expired Message */}
              {timeLeft === 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">OTP has expired</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    Please contact support or try creating a new booking.
                  </p>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Instructions:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Check your email for the 6-digit OTP code</li>
                  <li>• Enter the code exactly as received</li>
                  <li>• The code expires in 5 minutes</li>
                  <li>• If you don't receive the email, check your spam folder</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isVerifying}
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerify}
                  disabled={isVerifying || otpCode.length !== 6 || timeLeft === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify Booking'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationModal;
