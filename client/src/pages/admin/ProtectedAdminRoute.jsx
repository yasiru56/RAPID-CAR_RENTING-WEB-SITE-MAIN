import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Protected route component for admin routes
export const ProtectedAdminRoute = () => {
  // Get token from local storage
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Check if user is authenticated and has admin role
  const isAdmin = token && user.role === 'admin';
  
  // If authenticated as admin, render the child routes, otherwise redirect to login
  return isAdmin ? <Outlet /> : <Navigate to="/admin/login" />;
};

// Free route that doesn't require authentication
export const FreeRoute = () => {
  return <Outlet />;
};

