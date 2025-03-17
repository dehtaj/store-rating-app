import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" />;
    } else if (user.role === "USER") {
      return <Navigate to="/user" />;
    } else if (user.role === "STORE_OWNER") {
      return <Navigate to="/store-owner" />;
    }
  }

  return children;
};

export default PrivateRoute;
