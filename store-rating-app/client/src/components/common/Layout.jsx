import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Layout = ({ children, title }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getDashboardLink = () => {
    if (user?.role === "ADMIN") {
      return "/admin";
    } else if (user?.role === "USER") {
      return "/user";
    } else if (user?.role === "STORE_OWNER") {
      return "/store-owner";
    }
    return "/";
  };

  return (
    <div className="flex flex-col bg-red-300
min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-8xl bg-gray-200 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link
                  to={getDashboardLink()}
                  className="text-xl font-bold text-blue-600"
                >
                  Store Rating App
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              {user && (
                <div className="ml-4 flex items-center md:ml-6">
                  <span className="text-gray-800 mr-4">
                    Welcome, {user.name} ({user.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {title && (
            <div className="px-4 py-6 sm:px-0">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>
          )}
          <div className="px-4 py-6 sm:px-0">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Store Rating App. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
