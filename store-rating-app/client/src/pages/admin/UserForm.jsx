import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { userService } from "../../services/api";

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER",
  });
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchUser = async () => {
        try {
          setIsLoading(true);
          const response = await userService.getUserById(id);
          const userData = response.data;

          // Remove password from form data in edit mode
          const { password, ...userDataWithoutPassword } = userData;

          setFormData(userDataWithoutPassword);
        } catch (err) {
          console.error("Error fetching user:", err);
          setErrors(["Failed to load user data. Please try again later."]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUser();
    }
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

    // Only validate these fields if they are provided (or in create mode)
    if (!isEditMode || formData.name) {
      // Name validation: Min 20 characters, Max 60 characters
      if (formData.name.length < 20 || formData.name.length > 60) {
        validationErrors.push("Name must be between 20 and 60 characters");
      }
    }

    if (!isEditMode || formData.email) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        validationErrors.push("Please provide a valid email address");
      }
    }

    if (!isEditMode || formData.password) {
      // Password validation: 8-16 characters, at least one uppercase letter and one special character
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
      if (!passwordRegex.test(formData.password)) {
        validationErrors.push(
          "Password must be 8-16 characters with at least one uppercase letter and one special character"
        );
      }
    }

    if (!isEditMode || formData.address) {
      // Address validation: Max 400 characters
      if (formData.address.length > 400) {
        validationErrors.push("Address must not exceed 400 characters");
      }
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
      if (isEditMode) {
        // In edit mode, only send fields that are provided
        const dataToUpdate = {};
        if (formData.name) dataToUpdate.name = formData.name;
        if (formData.email) dataToUpdate.email = formData.email;
        if (formData.password) dataToUpdate.password = formData.password;
        if (formData.address) dataToUpdate.address = formData.address;
        if (formData.role) dataToUpdate.role = formData.role;

        await userService.updateUser(id, dataToUpdate);
      } else {
        await userService.createUser(formData);
      }

      // Redirect to users list
      navigate("/admin/users");
    } catch (err) {
      console.error("Error saving user:", err);
      setErrors(
        err.response?.data?.errors || [
          err.response?.data?.message ||
            `Failed to ${
              isEditMode ? "update" : "create"
            } user. Please try again.`,
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
          {isEditMode ? "Edit User" : "Add User"}
        </h2>
        <Link
          to="/admin/users"
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
        >
          Back to Users
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
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Full Name (min 20 characters)"
                required={!isEditMode}
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
                required={!isEditMode}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password{" "}
                {isEditMode && (
                  <span className="text-gray-500 text-xs">
                    (Leave blank to keep current password)
                  </span>
                )}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password (8-16 chars, 1 uppercase, 1 special char)"
                required={!isEditMode}
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
                placeholder="Address"
                required={!isEditMode}
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
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
                ? "Update User"
                : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
