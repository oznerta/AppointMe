import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NavigationMenu from '../SharedComponents/NavigationMenu';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: ('merchant' | 'superadmin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { role, isAuth, status, fetchUserData } = useAuth(); // Added fetchUserData to refresh user data
    const location = useLocation(); // Get current location

    // Fetch user data when component mounts or when location changes
    useEffect(() => {
        fetchUserData(); // Ensure that user data is up-to-date on each page load or redirect
    }, [location.pathname]);

    // Check if the user is authenticated
    if (!isAuth) {
        return <Navigate to="/signin" />;
    }

    // If the user is a merchant and their status is pending
    if (role === 'merchant' && status === 'pending') {
        // Allow access only to the WaitingApproval page
        if (location.pathname === '/waiting-for-approval') {
            return (
                <>
                    <NavigationMenu /> {/* Render NavigationMenu for waiting approval */}
                    <div className="p-4">{children}</div> {/* Render WaitingApproval content */}
                </>
            );
        }
        // Redirect to WaitingApproval page for merchants with pending status
        return <Navigate to="/waiting-for-approval" />;
    }

    // If the user is a merchant and their status is incomplete
    if (role === 'merchant' && status === 'incomplete') {
        // Allow access to the merchantDetails page
        if (location.pathname === '/merchant/details') {
            return (
                <>
                    <NavigationMenu /> {/* Render NavigationMenu for merchant details */}
                    <div className="p-4">{children}</div> {/* Render merchantDetails content */}
                </>
            );
        }
        // If trying to access any other route, redirect to merchantDetails
        return <Navigate to="/merchant/details" />;
    }

    // Check if the user has the required role and is approved
    if (!allowedRoles.includes(role as any) || (role === 'merchant' && status !== 'approved')) {
        return <Navigate to="/waiting-for-approval" />;
    }

    return (
        <>
            <NavigationMenu /> {/* Navigation bar */}
            <div className="p-4">{children}</div> {/* Render protected content */}
        </>
    );
};

export default ProtectedRoute;
