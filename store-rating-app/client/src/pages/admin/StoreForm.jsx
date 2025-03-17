import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { storeService, userService } from "../../services/api";

const StoreForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: "",
  });
  const [storeOwners, setStoreOwners] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch store owners and store data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch store owners (users with STORE_OWNER role or without a store)
        const usersResponse = await userService.getAllUsers();
        const users = usersResponse.data;

        // Filter users who are either store owners or normal users (potential store owners)
        const potentialOwners = users.filter(
          (user) => user.role === "STORE_OWNER" || user.role === "USER"
        );

        setStoreOwners(potentialOwners);

        // If in edit mode, fetch store data
        if (isEditMode) {
          const storeResponse = await storeService.getStoreById(id);
          setFormData(storeResponse.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setErrors(["Failed to load data. Please try again later."]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const validationErrors = [];

    // Name validation: Min 20 characters, Max 60 characters
    if (formData.name.length < 20 || formData.name.length > 60) {
      validationErrors.push("Store name must be between 20 and 60 characters");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      validationErrors.push("Please provide a valid email address");
    }

    // Address validation: Max 400 characters
    if (formData.address.length > 400) {
      validationErrors.push("Address must not exceed 400 characters");
    }

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsSubmitting(true);

    try {
      // Prepare data for submission
      const storeData = {
        name: formData.name,
        email: formData.email,
        address: formData.address,
        ownerId: formData.ownerId || null,
      };

      if (isEditMode) {
        await storeService.updateStore(id, storeData);
      } else {
        await storeService.createStore(storeData);
      }

      // Redirect to stores list
      navigate("/admin/stores");
    } catch (err) {
      console.error("Error saving store:", err);
      setErrors(
        err.response?.data?.errors || [
          err.response?.data?.message ||
            `Failed to ${
              isEditMode ? "update" : "create"
            } store. Please try again.`,
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEditMode ? "Edit Store" : "Add Store"}
        </h2>
        <Link
          to="/admin/stores"
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
        >
          Back to Stores
        </Link>
      </div>

      {errors.length > 0 && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <ul className="list-disc pl-5">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Store Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Store Name (min 20 characters)"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email Address"
                required
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Store Address"
                required
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="ownerId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Store Owner
              </label>
              <select
                id="ownerId"
                name="ownerId"
                value={formData.ownerId || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">No Owner (Unassigned)</option>
                {storeOwners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email}) - {owner.role}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Note: Assigning a store to a normal user will convert them to a
                Store Owner.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/stores")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md text-white text-sm font-medium ${
                isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting
                ? "Saving..."
                : isEditMode
                ? "Update Store"
                : "Create Store"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreForm;
