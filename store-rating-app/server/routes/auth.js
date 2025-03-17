const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");
const {
  validateUser,
  validatePasswordUpdate,
} = require("../middleware/validation");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Register a new user
router.post("/register", validateUser, async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        role: "USER",
      },
    });

    // Log the created user for debugging
    console.log("Created user:", user);

    // Create token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Return user data without password
    const userData = { ...user };
    delete userData.password;

    // Send response with user data and token
    return res.status(201).json({
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res
      .status(500)
      .json({ message: "Server error during registration" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch ? "Yes" : "No");

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    console.log("Token created:", token ? "Yes" : "No");
    console.log("User ID in token:", user.id);

    // Return user data without password
    const userData = { ...user };
    delete userData.password;

    // Send response with user data and token
    return res.json({
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
});

// Get current user
router.get("/me", authenticate, async (req, res) => {
  try {
    // Return user data without password
    const userData = { ...req.user };
    delete userData.password;
    return res.json(userData);
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Update password
router.put(
  "/password",
  authenticate,
  validatePasswordUpdate,
  async (req, res) => {
    try {
      const { password } = req.body;

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update user password
      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword },
      });

      return res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password update error:", error);
      return res
        .status(500)
        .json({ message: "Server error during password update" });
    }
  }
);

module.exports = router;
