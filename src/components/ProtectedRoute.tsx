/**
 * Protected Route Component
 * Redirects to login page if user is not authenticated
 */
import { FC, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protects routes that require authentication
 * Redirects to login page if user is not authenticated
 * Preserves the original URL in state for redirect after login
 */
const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with the current location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
