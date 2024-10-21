import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SalesOverviewChart } from '@/components/SharedComponents/ChartsComponent/SalesOverviewChart';
import { ServiceSalesChart } from '@/components/SharedComponents/ChartsComponent/ServiceSalesChart';
import RecentTransactions from './../../components/SharedComponents/RecentTransactions';
import MerchantBalance from '../../components/SharedComponents/MerchantBalance';

const MerchantDashboard: React.FC = () => {
  const { isAuth, status, userData } = useAuth();

  // Redirect to sign-in if not authenticated
  if (!isAuth) {
    return <Navigate to="/signin" />;
  }

  // Show loading while status is being determined
  if (status === null) {
    return <div className="text-center">Loading...</div>;
  }

  // Redirect if the user is authenticated but not approved
  if (isAuth && status !== 'approved') {
    return <Navigate to="/waiting-for-approval" />;
  }

  // Ensure userData is available before passing merchantId and userId
  const merchantId = userData?.id;
  const userId = userData?.id || "";

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <h2 className="text-lg font-semibold">Dashboard</h2>

      {merchantId ? (
        <div className="mb-8">
          <MerchantBalance merchantId={merchantId} userId={userId} /> {/* Pass userId here */}
        </div>
      ) : (
        <div className="text-red-500 text-center">Merchant data not found.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-4">Recent Appointments</h2>
          <RecentTransactions />
        </div>

        <div className="bg-white shadow rounded-xl p-4">
          <SalesOverviewChart />
        </div>

        <div className="bg-white shadow rounded-xl p-4 md:col-span-2">
          <ServiceSalesChart />
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
