import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Eye, EyeOff, User, Mail, Lock, Phone, MapPin, Globe, FileText, Heart } from 'lucide-react';
import { authApi } from '../../api/auth';
import { guestsApi } from '../../api/guests';

interface GuestRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface RegistrationData {
  // Step 1: Account creation
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: Guest information
  firstName: string;
  lastName: string;
  phone: string;
  idNumber: string;
  nationality: string;
  address: string;
  preferences: string[];
}

const GuestRegistrationModal = ({ isOpen, onClose, onSuccess }: GuestRegistrationModalProps) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login'); // Start with login mode
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState<RegistrationData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    idNumber: '',
    nationality: '',
    address: '',
    preferences: []
  });

  const [preferenceInput, setPreferenceInput] = useState('');

  const validateLogin = (): boolean => {
    const newErrors: string[] = [];
    
    if (!formData.username.trim()) {
      newErrors.push('Username is required');
    }
    
    if (!formData.password) {
      newErrors.push('Password is required');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const validateStep1 = (): boolean => {
    const newErrors: string[] = [];
    
    if (!formData.username.trim()) {
      newErrors.push('Username is required');
    }
    
    if (!formData.email.trim()) {
      newErrors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push('Please enter a valid email address');
    }
    
    if (!formData.password) {
      newErrors.push('Password is required');
    } else {
      if (formData.password.length < 8) {
        newErrors.push('Password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])/.test(formData.password)) {
        newErrors.push('Password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(formData.password)) {
        newErrors.push('Password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(formData.password)) {
        newErrors.push('Password must contain at least one digit');
      }
      if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password)) {
        newErrors.push('Password must contain at least one special character');
      }
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Passwords do not match');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: string[] = [];
    
    if (!formData.firstName.trim()) {
      newErrors.push('First name is required');
    }
    
    if (!formData.lastName.trim()) {
      newErrors.push('Last name is required');
    }
    
    if (!formData.phone.trim()) {
      newErrors.push('Phone number is required');
    }
    
    if (!formData.idNumber.trim()) {
      newErrors.push('ID number is required');
    }
    
    if (!formData.nationality.trim()) {
      newErrors.push('Nationality is required');
    }
    
    if (!formData.address.trim()) {
      newErrors.push('Address is required');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const addPreference = () => {
    if (preferenceInput.trim() && !formData.preferences.includes(preferenceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        preferences: [...prev.preferences, preferenceInput.trim()]
      }));
      setPreferenceInput('');
    }
  };

  const removePreference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.filter((_, i) => i !== index)
    }));
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;
    
    setLoading(true);
    setErrors([]);
    
    try {
      const response = await authApi.loginGuest(
        formData.username,
        formData.password
      );
      
      if (response.success) {
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
          onSuccess();
          onClose();
          // Redirect based on user role
          if (response.data.role === 'guest') {
            navigate('/guest/menu');
          } else {
            navigate('/admin/dashboard');
          }
        }, 1500);
      } else {
        setErrors([response.message]);
      }
    } catch (error) {
      setErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const handleStep1Submit = async () => {
    if (!validateStep1()) return;
    
    setLoading(true);
    setErrors([]);
    
    try {
      const response = await authApi.registerGuest(
        formData.username,
        formData.email,
        formData.password
      );
      
      if (response.success) {
        setCurrentStep(2);
        setSuccessMessage('Account created successfully! Please fill in your guest information.');
      } else {
        setErrors(response.data.errors || [response.message]);
      }
    } catch (error) {
      setErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!validateStep2()) return;
    
    setLoading(true);
    setErrors([]);
    
    try {
      const response = await guestsApi.createGuestInfo({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        idNumber: formData.idNumber,
        nationality: formData.nationality,
        address: formData.address,
        preferences: formData.preferences
      });
      
      if (response.success) {
        setSuccessMessage('Registration completed successfully! Redirecting...');
        setTimeout(() => {
          onSuccess();
          onClose();
          // After registration, guests are redirected to guest menu
          navigate('/guest/menu');
        }, 2000);
      } else {
        setErrors([response.message]);
      }
    } catch (error) {
      setErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMode('login');
    setCurrentStep(1);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      idNumber: '',
      nationality: '',
      address: '',
      preferences: []
    });
    setErrors([]);
    setSuccessMessage('');
    setPreferenceInput('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Guest Login' : 'Guest Registration'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {mode === 'login' 
                ? 'Sign in to your account to book rooms' 
                : `Step ${currentStep} of 2: ${currentStep === 1 ? 'Create Account' : 'Guest Information'}`
              }
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar - Only show for registration mode */}
        {mode === 'register' && (
          <div className="px-6 py-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{successMessage}</p>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <ul className="text-red-800 space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {mode === 'login' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline w-4 h-4 mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          ) : currentStep === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline w-4 h-4 mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Password must contain at least 8 characters with uppercase, lowercase, digit, and special character.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline w-4 h-4 mr-2" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-2" />
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-2" />
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline w-4 h-4 mr-2" />
                  ID Number
                </label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your ID number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline w-4 h-4 mr-2" />
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your nationality"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full address"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Heart className="inline w-4 h-4 mr-2" />
                  Preferences (Optional)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={preferenceInput}
                    onChange={(e) => setPreferenceInput(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a preference (e.g., Non-smoking room)"
                    onKeyPress={(e) => e.key === 'Enter' && addPreference()}
                  />
                  <button
                    type="button"
                    onClick={addPreference}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.preferences.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.preferences.map((preference, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {preference}
                        <button
                          type="button"
                          onClick={() => removePreference(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          {mode === 'login' ? (
            <div className="space-y-4">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Create one here
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={currentStep === 1 ? handleClose : () => setCurrentStep(1)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
              
              <button
                onClick={currentStep === 1 ? handleStep1Submit : handleStep2Submit}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : currentStep === 1 ? 'Create Account' : 'Complete Registration'}
              </button>
            </div>
          )}
          
          {mode === 'register' && currentStep === 1 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestRegistrationModal;
