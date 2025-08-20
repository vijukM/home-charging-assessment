// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const location = useLocation();
  
  // Proveri da li je korisnik ulogovan
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('ProtectedRoute: No token, redirecting to login');
    // Preusmeri na home jer nemaš login stranicu
    return <Navigate to="/" replace />;
  }
  
  // Ako je potrebna specifična uloga, proveri je
  if (requiredRole) {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    // Debug
    console.log('ProtectedRoute Debug:', {
      path: location.pathname,
      requiredRole: requiredRole,
      user: user,
      userRoles: user?.roles
    });
    
    // Proveri da li user ima potrebnu ulogu
    const hasRole = user && user.roles && user.roles.includes(requiredRole);
    
    if (!hasRole) {
      console.log(`ProtectedRoute: User doesn't have required role '${requiredRole}'`);
      console.log('Available roles:', user?.roles);
      
      // Preusmeri na home page
      return <Navigate to="/" replace />;
    }
  }
  
  console.log('ProtectedRoute: Access granted to', location.pathname);
  return children;
};

export default ProtectedRoute;