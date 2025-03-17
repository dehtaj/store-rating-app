import axios from "axios";

const API_URL = "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log(
      `API Request to ${config.url}`,
      token ? "With token" : "No token"
    );
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    console.log(`API Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error(
      `API Error from ${error.config?.url}:`,
      error.response?.status,
      error.message
    );
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (userData) => api.post("/auth/register", userData),
  getCurrentUser: () => api.get("/auth/me"),
  updatePassword: (password) => api.put("/auth/password", { password }),
};

// User services
export const userService = {
  getAllUsers: (filters = {}) => api.get("/users", { params: filters }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post("/users", userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Store services
export const storeService = {
  getAllStores: (filters = {}) => api.get("/stores", { params: filters }),
  getStoreById: (id) => api.get(`/stores/${id}`),
  getStoreWithUserRating: (id) => api.get(`/stores/${id}/user-rating`),
  createStore: (storeData) => api.post("/stores", storeData),
  updateStore: (id, storeData) => api.put(`/stores/${id}`, storeData),
  deleteStore: (id) => api.delete(`/stores/${id}`),
};

// Rating services
export const ratingService = {
  getAllRatings: () => api.get("/ratings"),
  submitRating: (storeId, value) => api.post("/ratings", { storeId, value }),
  updateRating: (id, value) => api.put(`/ratings/${id}`, { value }),
  deleteRating: (id) => api.delete(`/ratings/${id}`),
  getStoreRatings: (storeId) => api.get(`/ratings/store/${storeId}`),
  getUserRatingForStore: (userId, storeId) =>
    api.get(`/ratings/user/${userId}/store/${storeId}`),
};

// Dashboard services
export const dashboardService = {
  getAdminDashboard: () => api.get("/dashboard/admin"),
  getStoreOwnerDashboard: () => api.get("/dashboard/store-owner"),
};

export default api;
