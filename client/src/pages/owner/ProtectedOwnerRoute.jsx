import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Protected route component for admin routes
export const ProtectedOwnerRoute = () => {
  // Get token from local storage
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Check if user is authenticated and has admin role
  const isOwner = token && user.role === 'owner';
  
  // If authenticated as admin, render the child routes, otherwise redirect to login
  return isOwner ? <Outlet /> : <Navigate to="/owner/login" />;
};

// Free route that doesn't require authentication
export const FreeRoute = () => {
  return <Outlet />;
};

