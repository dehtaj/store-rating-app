import { createContext, useState, useEffect } from "react";
import { authService } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      console.log("Token in localStorage:", token ? "exists" : "not found");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        console.log("Attempting to fetch current user...");
        const response = await authService.getCurrentUser();
        console.log("Current user response:", response.data);
        setUser(response.data);
        localStorage.setItem("userId", response.data.id);
      } catch (err) {
        console.error("Failed to load user:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      console.log("Attempting login with:", email);
      const response = await authService.login(email, password);
      console.log("Login response:", response.data);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.user.id);
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed");
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      console.log("Attempting registration with:", userData.email);
      const response = await authService.register(userData);
      console.log("Registration response:", response.data);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.user.id);
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    }
  };

  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
  };

  const updatePassword = async (password) => {
    try {
      setError(null);
      console.log("Updating password...");
      await authService.updatePassword(password);
      return true;
    } catch (err) {
      console.error("Password update error:", err);
      setError(err.response?.data?.message || "Password update failed");
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
