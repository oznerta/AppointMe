import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MerchantDashboard: React.FC = () => {
  const { isAuth, status } = useAuth(); // Use loading and status from context



  // If the user is not authenticated, redirect to the sign-in page
  if (!isAuth) {
    return <Navigate to="/signin" />;
  }

  // If the user's approval status is still being determined
  if (status === null) {
    return <div>Loading...</div>; // Show a loading spinner or message
  }

  // If the user is authenticated but not approved, redirect them back
  if (isAuth && status !== 'approved') {
    return <Navigate to="/waiting-for-approval" />;
  }

  return (
    <div>
      <h1>Welcome to Your Merchant Dashboard!</h1>
      <p>Here you can manage your services and view your performance.</p>
      {/* Add additional dashboard content here */}
    </div>
  );
};

export default MerchantDashboard;
