import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/user/Dashboard";
import StoreOwnerDashboard from "./pages/store-owner/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";
import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" /> : <Register />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              {user?.role === "ADMIN" ? (
                <Navigate to="/admin" />
              ) : user?.role === "STORE_OWNER" ? (
                <Navigate to="/store-owner" />
              ) : (
                <UserDashboard user={user} />
              )}
            </ProtectedRoute>
          }
        />

        {/* User Routes */}
        <Route
          path="/user/*"
          element={
            <ProtectedRoute user={user} requiredRoles={["USER"]}>
              <UserDashboard user={user} />
            </ProtectedRoute>
          }
        />

        {/* Store Owner Routes */}
        <Route
          path="/store-owner/*"
          element={
            <ProtectedRoute user={user} requiredRoles={["STORE_OWNER"]}>
              <StoreOwnerDashboard user={user} />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute user={user} requiredRoles={["ADMIN"]}>
              <AdminDashboard user={user} />
            </ProtectedRoute>
          }
        />

        {/* Redirect root to dashboard or login */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
