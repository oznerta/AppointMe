import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import SignUpPage from './Auth/Signup';
import SignInPage from './Auth/Signin';
import MerchantDetails from './Auth/MerchantDetails';
import WaitingApproval from './Pages/MerchantPages/WaitingApproval';
import MerchantDashboard from './Pages/MerchantPages/MerchantDashboard'; 
import SuperAdminDashboard from './Pages/SuperAdminPages/SuperAdminDashboard'; 
import Settings from './Pages/MerchantPages/Settings'; 
import ServiceManagement from './Pages/MerchantPages/ServiceManagement'; 
import ProtectedRoute from './components/ProtectedRoutes/protectedroutes';
import MerchantWebpage from './Pages/PublicPages/MerchantWebpage';
import Appointments from './Pages/MerchantPages/Appointments';
import ToastContainer from './components/SharedComponents/ToastContainer'; // Import ToastContainer

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PayPalScriptProvider options={{ "clientId": import.meta.env.VITE_PAYPAL_CLIENT_ID }}>
        <Router>
          <ToastContainer /> {/* Include the ToastContainer */}
          <Routes>
            {/* Public Routes */}
            <Route path="/signup" element={<ProtectedRedirect route="/signup" />} />
            <Route path="/signin" element={<ProtectedRedirect route="/signin" />} />
            <Route path="/" element={<Navigate to="/signin" replace />} />
            <Route path="/:uniqueLink" element={<MerchantWebpage />} />

            {/* Protected Routes */}
            <Route path="/merchant/details" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantDetails />
              </ProtectedRoute>
            } />
            <Route path="/merchant/dashboard" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantDashboard />
              </ProtectedRoute>
            } />
            <Route path="/superadmin/dashboard" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/merchant/settings" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/merchant/appointments" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <Appointments />
              </ProtectedRoute>
            } />
            <Route path="/merchant/service-management" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <ServiceManagement />
              </ProtectedRoute>
            } />
            <Route path="/waiting-for-approval" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <WaitingApproval />
              </ProtectedRoute>
            } />

            {/* Redirect to Sign In for Unauthorized Access */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        </Router>
      </PayPalScriptProvider>
    </AuthProvider>
  );
};

// This component checks the user's authentication state and role
const ProtectedRedirect: React.FC<{ route: string }> = ({ route }) => {
  const { isAuth, role } = useAuth();

  // If the user is authenticated, redirect based on their role
  if (isAuth) {
    if (role === 'merchant') {
      return <Navigate to="/merchant/dashboard" replace />;
    } else if (role === 'superadmin') {
      return <Navigate to="/superadmin/dashboard" replace />;
    }
  }

  // If the route is sign-up or sign-in, allow access
  return route === '/signup' ? <SignUpPage /> : <SignInPage />;
};

export default App;
