const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log(
      "Auth middleware - Token:",
      token ? "Token exists" : "No token"
    );

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify token
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "Access denied. Admin role required." });
  }
  next();
};

// Middleware to check if user is store owner
const isStoreOwner = (req, res, next) => {
  if (req.user.role !== "STORE_OWNER") {
    return res
      .status(403)
      .json({ message: "Access denied. Store owner role required." });
  }
  next();
};

module.exports = { authenticate, isAdmin, isStoreOwner };
