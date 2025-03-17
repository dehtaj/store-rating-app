import { useState, useEffect, useContext } from "react";
import { storeService, ratingService } from "../../services/api";
import StoreRatingModal from "./StoreRatingModal";
import { AuthContext } from "../../context/AuthContext";

const StoreList = ({ userRole }) => {
  const { user } = useContext(AuthContext);
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        let response;

        if (userRole === "USER") {
          // For normal users, get stores with their ratings
          response = await storeService.getAllStores();
        } else {
          // For admin, get all stores
          response = await storeService.getAllStores();
        }

        // Calculate average rating for each store
        const storesWithRatings = await Promise.all(
          response.data.map(async (store) => {
            try {
              // Get user's rating for this store if user is logged in
              if (userRole === "USER" && user) {
                const ratingResponse = await ratingService.getStoreRatings(
                  store.id
                );
                const ratings = ratingResponse.data;

                // Calculate average rating
                const totalRating = ratings.reduce(
                  (sum, r) => sum + r.value,
                  0
                );
                const avgRating =
                  ratings.length > 0
                    ? (totalRating / ratings.length).toFixed(1)
                    : "0.0";

                // Find user's rating
                const userRating = ratings.find((r) => r.user.id === user.id);

                return {
                  ...store,
                  rating: avgRating,
                  ratingCount: ratings.length,
                  userRating: userRating ? userRating.value : null,
                  userRatingId: userRating ? userRating.id : null,
                };
              }

              return store;
            } catch (err) {
              console.error(
                `Error fetching ratings for store ${store.id}:`,
                err
              );
              return {
                ...store,
                rating: "0.0",
                ratingCount: 0,
                userRating: null,
                userRatingId: null,
              };
            }
          })
        );

        setStores(storesWithRatings);
        setFilteredStores(storesWithRatings);
      } catch (err) {
        console.error("Error fetching stores:", err);
        setError("Failed to load stores. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [userRole, user]);

  // Filter stores based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStores(stores);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = stores.filter(
        (store) =>
          store.name.toLowerCase().includes(term) ||
          store.address.toLowerCase().includes(term)
      );
      setFilteredStores(filtered);
    }
  }, [searchTerm, stores]);

  // Sort stores
  useEffect(() => {
    const sortedStores = [...filteredStores].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredStores(sortedStores);
  }, [sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleRateStore = (store) => {
    setSelectedStore(store);
    setIsModalOpen(true);
  };

  const handleRatingSubmitted = (updatedStore) => {
    // Update the store in the list
    const updatedStores = stores.map((store) =>
      store.id === updatedStore.id ? updatedStore : store
    );
    setStores(updatedStores);
    setFilteredStores(
      filteredStores.map((store) =>
        store.id === updatedStore.id ? updatedStore : store
      )
    );

    // Close modal
    setIsModalOpen(false);
    setSelectedStore(null);
  };

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

  return (
    <div>
      {/* Search and filter */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="Search by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Stores list */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Store Name
                  {sortConfig.key === "name" && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("address")}
              >
                <div className="flex items-center">
                  Address
                  {sortConfig.key === "address" && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("rating")}
              >
                <div className="flex items-center">
                  Rating
                  {sortConfig.key === "rating" && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              {userRole === "USER" && (
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                >
                  Your Rating
                </th>
              )}
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStores.length === 0 ? (
              <tr>
                <td
                  colSpan={userRole === "USER" ? 5 : 4}
                  className="px-6 py-4 text-center text-sm text-gray-700"
                >
                  No stores found
                </td>
              </tr>
            ) : (
              filteredStores.map((store) => (
                <tr key={store.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {store.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {store.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center">
                      <span className="text-yellow-600 mr-1">★</span>
                      <span>
                        {store.rating} ({store.ratingCount || 0})
                      </span>
                    </div>
                  </td>
                  {userRole === "USER" && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {store.userRating ? (
                        <div className="flex items-center">
                          <span className="text-yellow-600 mr-1">★</span>
                          <span>{store.userRating}</span>
                        </div>
                      ) : (
                        <span className="text-gray-700">Not rated</span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {userRole === "USER" && (
                      <button
                        onClick={() => handleRateStore(store)}
                        className="text-blue-700 hover:text-blue-900"
                      >
                        {store.userRating ? "Update Rating" : "Rate Store"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rating Modal */}
      {isModalOpen && selectedStore && (
        <StoreRatingModal
          store={selectedStore}
          onClose={() => setIsModalOpen(false)}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  );
};

export default StoreList;
