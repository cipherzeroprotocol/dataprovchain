import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { WalletProvider } from './contexts/WalletContext';
import { AuthProvider } from './contexts/AuthContext';
import { ContractProvider } from './contexts/ContractContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './components/layout/MainLayout';

// Import page components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DatasetSubmission from './pages/DatasetSubmission';
import Marketplace from './pages/Marketplace';
import Dashboard from './pages/Dashboard';
import ProvenanceExplorer from './pages/ProvenanceExplorer';
import DatasetDetail from './pages/DatasetDetail';
import AttributionManager from './pages/AttributionManager';
import UserProfile from './pages/UserProfile';
import DAO from './pages/DAO';
import Documentation from './pages/Documentation';

// Import protected route helper
import ProtectedRoute from './components/common/ProtectedRoute';

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <WalletProvider>
            <AuthProvider>
              <ContractProvider>
                <NotificationProvider>
                  <MainLayout>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/marketplace" element={<Marketplace />} />
                      <Route path="/marketplace/:id" element={<DatasetDetail />} />
                      <Route path="/provenance" element={<ProvenanceExplorer />} />
                      <Route path="/dao" element={<DAO />} />
                      <Route path="/docs" element={<Documentation />} />
                      
                      {/* Protected routes */}
                      <Route 
                        path="/submit" 
                        element={
                          <ProtectedRoute>
                            <DatasetSubmission />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/attribution" 
                        element={
                          <ProtectedRoute>
                            <AttributionManager />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/attribution/:id" 
                        element={
                          <ProtectedRoute>
                            <AttributionManager />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/profile" 
                        element={
                          <ProtectedRoute>
                            <UserProfile />
                          </ProtectedRoute>
                        } 
                      />
                    </Routes>
                  </MainLayout>
                </NotificationProvider>
              </ContractProvider>
            </AuthProvider>
          </WalletProvider>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
