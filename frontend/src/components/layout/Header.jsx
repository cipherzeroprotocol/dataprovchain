import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletContext } from '../../contexts/WalletContext';
import { AuthContext } from '../../contexts/AuthContext';
import { formatAddress } from '../../utils/web3';
import Button from '../common/Button';

const Header = () => {
  const location = useLocation();
  const { isConnected, account, connect, disconnect } = useContext(WalletContext);
  const { isAuthenticated, user, login, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [ setIsLoggingIn] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleLogin = async () => {
    if (!isConnected) {
      await handleConnect();
    }
    
    try {
      setIsLoggingIn(true);
      await login();
    } catch (error) {
      console.error('Failed to login:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Submit Dataset', path: '/submit' },
    { name: 'Provenance Explorer', path: '/provenance' },
    { name: 'DAO', path: '/dao' }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img
                  className="h-8 w-auto"
                  src="/images/logo.svg"
                  alt="DataProvChain"
                />
                <span className="ml-2 text-xl font-bold text-gray-900">DataProvChain</span>
              </Link>
            </div>
            
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full
                    ${isActive(link.path)
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }
                  `}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isConnected ? (
              <div className="relative ml-3">
                <div>
                  <button
                    type="button"
                    className="flex items-center max-w-xs bg-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {user?.username?.substring(0, 1).toUpperCase() || account.substring(2, 3).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-2">
                        <p className="text-sm font-medium text-gray-700">
                          {user?.username || formatAddress(account)}
                        </p>
                        {isAuthenticated && (
                          <p className="text-xs text-gray-500">
                            {formatAddress(account)}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
                
                {isProfileMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    {isAuthenticated ? (
                      <>
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <button
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => {
                            logout();
                            setIsProfileMenuOpen(false);
                          }}
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => {
                            handleLogin();
                            setIsProfileMenuOpen(false);
                          }}
                        >
                          Sign In
                        </button>
                        <button
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => {
                            disconnect();
                            setIsProfileMenuOpen(false);
                          }}
                        >
                          Disconnect Wallet
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleConnect}
              >
                Connect Wallet
              </Button>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium
                ${isActive(link.path)
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }
              `}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
        
        <div className="pt-4 pb-3 border-t border-gray-200">
          {isConnected ? (
            <>
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {user?.username?.substring(0, 1).toUpperCase() || account.substring(2, 3).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.username || 'Wallet User'}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {formatAddress(account)}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      onClick={() => {
                        handleLogin();
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign In
                    </button>
                    <button
                      className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      onClick={() => {
                        disconnect();
                        setIsMenuOpen(false);
                      }}
                    >
                      Disconnect Wallet
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="px-4">
              <Button
                variant="primary"
                onClick={handleConnect}
                fullWidth
              >
                Connect Wallet
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
