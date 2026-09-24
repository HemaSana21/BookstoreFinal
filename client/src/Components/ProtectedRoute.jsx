import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Generic role-aware route guard. Pass role="user" | "seller" | "admin" to
// restrict a route to that actor type; the matching login page is chosen
// automatically. Used by User/Seller/Admin protected pages alike.
const LOGIN_PATHS = { user: '/login', seller: '/seller/login', admin: '/admin/login' };

const ProtectedRoute = ({ role, children }) => {
  const { actor, actorType, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page-loader">Loading...</div>;
  if (!actor) return <Navigate to={LOGIN_PATHS[role] || '/login'} state={{ from: location.pathname }} replace />;
  if (role && actorType !== role) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
