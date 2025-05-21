import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);

  // If auth is still loading, show nothing
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // If not authenticated or not admin, redirect to home page
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If authenticated and admin, render the child routes
  return <Outlet />;
};

export default AdminRoute; 