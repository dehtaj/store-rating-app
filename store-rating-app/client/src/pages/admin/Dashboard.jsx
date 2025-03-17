import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Layout from "../../components/common/Layout";
import UserList from "./UserList";
import UserForm from "./UserForm";
import StoreList from "./StoreList";
import StoreForm from "./StoreForm";
import RatingList from "./RatingList";
import UpdatePassword from "../../components/common/UpdatePassword";
import { userService, storeService, ratingService } from "../../services/api";
import { formatDate } from "../../utils/helpers";

const Dashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/admin/users")) {
      setActiveTab("users");
    } else if (path.includes("/admin/stores")) {
      setActiveTab("stores");
    } else if (path.includes("/admin/ratings")) {
      setActiveTab("ratings");
    } else if (path.includes("/admin/profile")) {
      setActiveTab("profile");
    } else {
      setActiveTab("dashboard");
    }
  }, [location]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <Layout title="Admin Dashboard">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-white shadow-md rounded-lg p-4 md:mr-6 mb-6 md:mb-0">
          <nav>
            <ul>
              <li className="mb-2">
                <Link
                  to="/admin"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === "dashboard"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleTabChange("dashboard")}
                >
                  Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/admin/users"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === "users"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleTabChange("users")}
                >
                  Users
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/admin/stores"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === "stores"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleTabChange("stores")}
                >
                  Stores
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/admin/ratings"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === "ratings"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleTabChange("ratings")}
                >
                  Ratings
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/profile"
                  className={`block px-4 py-2 rounded-md ${
                    activeTab === "profile"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleTabChange("profile")}
                >
                  Profile
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/users/add" element={<UserForm />} />
            <Route path="/users/edit/:id" element={<UserForm />} />
            <Route path="/stores" element={<StoreList />} />
            <Route path="/stores/add" element={<StoreForm />} />
            <Route path="/stores/edit/:id" element={<StoreForm />} />
            <Route path="/ratings" element={<RatingList />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </Layout>
  );
};

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
    averageRating: 0,
  });
  const [recentRatings, setRecentRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch user count
        const usersResponse = await userService.getAllUsers();
        const totalUsers = usersResponse.data.length;

        // Fetch store count
        const storesResponse = await storeService.getAllStores();
        const totalStores = storesResponse.data.length;

        // Fetch ratings
        const ratingsResponse = await ratingService.getAllRatings();
        const ratings = ratingsResponse.data;
        const totalRatings = ratings.length;

        // Calculate average rating
        const averageRating =
          ratings.length > 0
            ? ratings.reduce(
                (sum, rating) => sum + (rating.value || rating.rating),
                0
              ) / ratings.length
            : 0;

        // Get recent ratings (last 5)
        const recentRatings = [...ratings]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setStats({
          totalUsers,
          totalStores,
          totalRatings,
          averageRating,
        });

        setRecentRatings(recentRatings);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Dashboard Overview
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👤"
          color="bg-blue-500"
        />
        <StatCard
          title="Total Stores"
          value={stats.totalStores}
          icon="🏪"
          color="bg-green-500"
        />
        <StatCard
          title="Total Ratings"
          value={stats.totalRatings}
          icon="⭐"
          color="bg-yellow-500"
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          icon="📊"
          color="bg-purple-500"
        />
      </div>

      {/* Recent Ratings */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-700">Recent Ratings</h3>
          <Link
            to="/admin/ratings"
            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>

        {recentRatings.length === 0 ? (
          <p className="text-gray-700">No ratings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Store
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Rating
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Comment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentRatings.map((rating) => (
                  <tr key={rating.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(rating.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rating.store?.name || "Unknown Store"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {rating.user?.name || "Anonymous"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">
                          {rating.value || rating.rating}
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${
                                i < (rating.value || rating.rating)
                                  ? "text-yellow-500"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                      {rating.comment || "No comment"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center">
        <div className={`${color} text-white p-3 rounded-full mr-4`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Account Settings
      </h2>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Update Password
        </h3>
        <UpdatePassword />
      </div>
    </div>
  );
};

export default Dashboard;
