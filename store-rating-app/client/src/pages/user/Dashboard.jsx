import { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Layout from "../../components/common/Layout";
import StoreList from "../../components/common/StoreList";
import UpdatePassword from "../../components/common/UpdatePassword";

const Dashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.pathname === "/user/profile" ? "profile" : "stores"
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <Layout title="User Dashboard">
      <div className="bg-red-300 shadow rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b  border-gray-200">
          <nav className="-mb-px flex">
            <Link
              to="/user"
              className={`${
                activeTab === "stores"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              onClick={() => handleTabChange("stores")}
            >
              Stores
            </Link>
            <Link
              to="/user/profile"
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
            <Route path="/" element={<StoreList userRole="USER" />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </Layout>
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
