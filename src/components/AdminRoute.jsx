// src/components/AdminRoute.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const { userRole, isAuthReady } = useAuth();

    if (!isAuthReady) {
        // Show a loading indicator while auth state is being determined
        return <div className="text-center py-10">Checking permissions...</div>;
    }

    if (userRole !== 'admin') {
        // If not an admin, redirect to the home page
        return <Navigate to="/" replace />;
    }

    // If user is an admin, render the requested component
    return children;
};

export default AdminRoute;