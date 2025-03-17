import { Navigate } from "react-router-dom";
import { hasRole } from "../utils/helpers";

/**
 * ProtectedRoute component to handle authentication and authorization
 *
 * @param {Object} props - Component props
 * @param {Object} props.user - The current user object
 * @param {string|string[]} [props.requiredRoles] - Required role(s) for accessing the route
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @returns {React.ReactNode} - The protected component or redirect
 */
const ProtectedRoute = ({ user, requiredRoles, children }) => {
  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check if user has the required role
  if (requiredRoles && !hasRole(user, requiredRoles)) {
    // Redirect based on user's role
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    } else if (user.role === "STORE_OWNER") {
      return <Navigate to="/store-owner" replace />;
    } else {
      return <Navigate to="/user" replace />;
    }
  }

  // User is authenticated and authorized, render the protected component
  return children;
};

export default ProtectedRoute;
