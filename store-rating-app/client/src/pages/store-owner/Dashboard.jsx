import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Layout from "../../components/common/Layout";
import UpdatePassword from "../../components/common/UpdatePassword";
import { dashboardService } from "../../services/api";

const Dashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.pathname === "/store-owner/profile" ? "profile" : "dashboard"
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <Layout title="Store Owner Dashboard">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <Link
              to="/store-owner"
              className={`${
                activeTab === "dashboard"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              onClick={() => handleTabChange("dashboard")}
            >
              Dashboard
            </Link>
            <Link
              to="/store-owner/ratings"
              className={`${
                activeTab === "ratings"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              onClick={() => handleTabChange("ratings")}
            >
              Ratings
            </Link>
            <Link
              to="/store-owner/profile"
              className={`${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              onClick={() => handleTabChange("profile")}
            >
              Profile
            </Link>
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-6">
          <Routes>
            <Route path="/" element={<StoreOwnerHome />} />
            <Route path="/ratings" element={<RatingsList />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </Layout>
  );
};

const StoreOwnerHome = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getStoreOwnerDashboard();
        setDashboardData(response.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
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
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No store data available.</p>
      </div>
    );
  }

  const { store, ratingStats } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Store Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Store Name</p>
            <p className="mt-1 text-lg text-gray-900">{store.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1 text-lg text-gray-900">{store.email}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500">Address</p>
            <p className="mt-1 text-lg text-gray-900">{store.address}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Rating Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Total Ratings</p>
            <p className="mt-1 text-3xl font-semibold text-blue-600">
              {ratingStats.totalRatings}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Average Rating</p>
            <p className="mt-1 text-3xl font-semibold text-yellow-600 flex items-center">
              <span className="text-yellow-500 mr-1">★</span>
              {ratingStats.averageRating}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">5-Star Ratings</p>
            <p className="mt-1 text-3xl font-semibold text-green-600">
              {ratingStats.ratingCounts[5]}
              <span className="text-sm text-gray-500 ml-1">
                (
                {ratingStats.totalRatings > 0
                  ? Math.round(
                      (ratingStats.ratingCounts[5] / ratingStats.totalRatings) *
                        100
                    )
                  : 0}
                %)
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Rating Distribution
          </h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center">
                <div className="w-12 text-sm font-medium text-gray-900">
                  {star} stars
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
                  <div
                    className="bg-yellow-400 h-2.5 rounded-full"
                    style={{
                      width: `${
                        ratingStats.totalRatings > 0
                          ? (ratingStats.ratingCounts[star] /
                              ratingStats.totalRatings) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="w-12 text-sm font-medium text-gray-500 ml-2">
                  {ratingStats.ratingCounts[star]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RatingsList = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getStoreOwnerDashboard();
        setDashboardData(response.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load ratings data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
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
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (
    !dashboardData ||
    !dashboardData.recentRatings ||
    dashboardData.recentRatings.length === 0
  ) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">
          No ratings available for your store yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Customer Ratings
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Customer
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Rating
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dashboardData.recentRatings.map((rating) => (
              <tr key={rating.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {rating.user.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {rating.user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="text-sm text-gray-900">
                      {rating.value}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(rating.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Profile = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Account Settings
        </h3>
        <UpdatePassword />
      </div>
    </div>
  );
};

export default Dashboard;
