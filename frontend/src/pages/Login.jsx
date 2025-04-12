import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { WalletContext } from '../contexts/WalletContext';
import { AuthContext } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, account, connect, error: walletError } = useContext(WalletContext);
  const { isAuthenticated, login, loading, error: authError } = useContext(AuthContext);
  
  const [step, setStep] = useState(isConnected ? 'authenticate' : 'connect');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const { from } = location.state || { from: { pathname: '/dashboard' } };
      navigate(from.pathname);
    }
  }, [isAuthenticated, navigate, location]);
  
  // Move to authenticate step when wallet is connected
  useEffect(() => {
    if (isConnected && step === 'connect') {
      setStep('authenticate');
    }
  }, [isConnected, step]);
  
  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };
  
  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await login();
    } catch (error) {
      console.error('Failed to login:', error);
    } finally {
      setIsLoggingIn(false);
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
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Connect your wallet to access your dashboard
            </p>
          </div>
          
          {step === 'connect' ? (
            <div>
              <Button
                variant="primary"
                onClick={handleConnect}
                loading={loading}
                disabled={loading}
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
                  Don&apos;t have an account?{' '}
                  <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  Connected Address:
                </p>
                <p className="mt-1 text-sm font-mono break-all">{account}</p>
              </div>
              
              <Button
                variant="primary"
                onClick={handleLogin}
                loading={isLoggingIn || loading}
                disabled={isLoggingIn || loading}
                fullWidth
              >
                Sign In With Wallet
              </Button>
              
              {authError && (
                <p className="mt-2 text-sm text-red-600">{authError}</p>
              )}
              
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('connect')}
                  fullWidth
                >
                  Use Different Wallet
                </Button>
              </div>
              
              <div className="mt-6">
                <p className="text-center text-sm text-gray-600">
                  Don&apos;t have an account?{' '}
                  <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Login;
