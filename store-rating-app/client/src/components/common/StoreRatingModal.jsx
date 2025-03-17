import { useState, useEffect, useContext } from "react";
import { ratingService } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

const StoreRatingModal = ({ store, onClose, onRatingSubmitted }) => {
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(store.userRating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Prevent scrolling when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (store.userRatingId) {
        // Update existing rating
        await ratingService.updateRating(store.userRatingId, rating);
      } else {
        // Submit new rating
        await ratingService.submitRating(store.id, rating);
      }

      // Get updated store with new rating
      const ratingResponse = await ratingService.getStoreRatings(store.id);
      const ratings = ratingResponse.data;

      // Calculate average rating
      const totalRating = ratings.reduce((sum, r) => sum + r.value, 0);
      const avgRating =
        ratings.length > 0 ? (totalRating / ratings.length).toFixed(1) : "0.0";

      // Find user's rating
      const userRating = ratings.find((r) => r.user.id === user.id);

      // Update store with new rating data
      const updatedStore = {
        ...store,
        rating: avgRating,
        ratingCount: ratings.length,
        userRating: userRating ? userRating.value : rating,
        userRatingId: userRating ? userRating.id : null,
      };

      onRatingSubmitted(updatedStore);
    } catch (err) {
      console.error("Error submitting rating:", err);
      setError(
        err.response?.data?.message ||
          "Failed to submit rating. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-60 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {store.userRating ? "Update Rating" : "Rate Store"}
          </h3>
          <button
            type="button"
            className="text-gray-500 bg-transparent hover:bg-gray-200 hover:text-gray-700 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-lg font-medium text-gray-900">{store.name}</h4>
            <p className="text-sm text-gray-700">{store.address}</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-2">Select your rating:</p>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="text-3xl focus:outline-none"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <span
                    className={`${
                      (hoveredRating ? hoveredRating >= value : rating >= value)
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
            <p className="text-center mt-2 text-sm text-gray-700">
              {rating === 0
                ? "No rating selected"
                : `Your rating: ${rating} star${rating !== 1 ? "s" : ""}`}
            </p>
          </div>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                isSubmitting ? "bg-blue-500" : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreRatingModal;
