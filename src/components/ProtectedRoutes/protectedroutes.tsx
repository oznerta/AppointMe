import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: ('merchant' | 'superadmin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { role, isAuth, status } = useAuth();
    const location = useLocation(); // Get current location

    // Check if the user is authenticated
    if (!isAuth) {
        return <Navigate to="/signin" />;
    }

    // If the user is a merchant and their status is pending
    if (role === 'merchant' && status === 'pending') {
        // Allow access only to the WaitingApproval page
        if (location.pathname === '/waiting-for-approval') {
            return <>{children}</>; // Render WaitingApproval component
        }
        return <Navigate to="/waiting-for-approval" />; // Redirect to WaitingApproval page for merchants
    }

    // Check if the user has the required role and is approved
    if (!allowedRoles.includes(role as any) || (role === 'merchant' && status !== 'approved')) {
        return <Navigate to="/waiting-for-approval" />;
    }

    return <>{children}</>; // Render the protected route component for approved users
};

export default ProtectedRoute;
