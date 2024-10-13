import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const WaitingApproval: React.FC = () => {
    console.log("WaitingApproval component mounted");
    const { isAuth, status } = useAuth();

    console.log("WaitingApproval - isAuth:", isAuth);
    console.log("WaitingApproval - status:", status);

    // If the user is not authenticated, redirect to the sign-in page
    if (!isAuth) {
        console.log("User is not authenticated, redirecting to /signin");
        return <Navigate to="/signin" />;
    }

    // If the user's approval status is still being determined
    if (status === null) {
        console.log("User status is null, showing loading...");
        return <div>Loading...</div>; // Show a loading spinner or message
    }

    // If the user is authenticated but their status is pending
    if (isAuth && status === 'pending') {
        console.log("User status is pending, showing waiting message");
        return (
            <div>
                <h1>Your Account is Pending Approval</h1>
                <p>Please wait while our team reviews your application.</p>
            </div>
        );
    }

    // // If the user is authenticated but their status is incomplete
    // if (isAuth && status === 'incomplete') {
    //     return <Navigate to="/merchant/details" />
    // }

    // If the user is approved, redirect them to the merchant dashboard
    if (status === 'approved') {
        console.log("User is approved, redirecting to /merchant/dashboard");
        return <Navigate to="/merchant/dashboard" />;
    }

    // Optional fallback for unexpected status values
    console.log("User status is unknown, showing fallback message");
    return <div>Your account status is unknown. Please contact support.</div>;
};

export default WaitingApproval;
