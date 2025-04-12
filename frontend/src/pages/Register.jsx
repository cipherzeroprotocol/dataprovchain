import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { WalletContext } from '../contexts/WalletContext';
import { AuthContext } from '../contexts/AuthContext';
import { register } from '../services/auth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Register = () => {
  const navigate = useNavigate();
  const { isConnected, account, connect, error: walletError } = useContext(WalletContext);
  const { isAuthenticated } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(isConnected ? 'details' : 'connect');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  // Move to details step when wallet is connected
  useEffect(() => {
    if (isConnected && step === 'connect') {
      setStep('details');
    }
  }, [isConnected, step]);
  
  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsRegistering(true);
      setRegistrationError(null);
      
      await register({
        username: formData.username,
        email: formData.email,
        walletAddress: account
      });
      
      // Redirect to login page after successful registration
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      setRegistrationError(error.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <div className="p-8">
          <div className="text-center mb-8">
            <img
              className="mx-auto h-12 w-auto"
              src="/images/logo.svg"
              alt="DataProvChain"
            />
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join DataProvChain to share and monetize your datasets
            </p>
          </div>
          
          {step === 'connect' ? (
            <div>
              <Button
                variant="primary"
                onClick={handleConnect}
                fullWidth
                className="flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Connect Wallet
              </Button>
              
              {walletError && (
                <p className="mt-2 text-sm text-red-600">{walletError}</p>
              )}
              
              <div className="mt-6">
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  Connected Address:
                </p>
                <p className="mt-1 text-sm font-mono break-all">{account}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    error={errors.username}
                    placeholder="Choose a username"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              {registrationError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{registrationError}</p>
                </div>
              )}
              
              <div className="mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isRegistering}
                  disabled={isRegistering}
                  fullWidth
                >
                  Create Account
                </Button>
              </div>
              
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('connect')}
                  fullWidth
                >
                  Use Different Wallet
                </Button>
              </div>
              
              <div className="mt-6">
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Register;
