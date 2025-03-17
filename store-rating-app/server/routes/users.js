const express = require("express");
const bcrypt = require("bcrypt");
const prisma = require("../prisma/client");
const { authenticate, isAdmin } = require("../middleware/auth");
const { validateUser } = require("../middleware/validation");

const router = express.Router();

// Get all users (admin only)
router.get("/", authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, address, role } = req.query;

    // Build filter object based on query parameters
    const filter = {};

    if (name) filter.name = { contains: name, mode: "insensitive" };
    if (email) filter.email = { contains: email, mode: "insensitive" };
    if (address) filter.address = { contains: address, mode: "insensitive" };
    if (role) filter.role = role;

    const users = await prisma.user.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        store: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: {
                value: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Calculate average rating for store owners
    const usersWithRating = users.map((user) => {
      if (user.role === "STORE_OWNER" && user.store) {
        const ratings = user.store.ratings;
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating.value, 0) /
              ratings.length
            : 0;

        return {
          ...user,
          rating: parseFloat(avgRating.toFixed(1)),
        };
      }
      return user;
    });

    res.json(usersWithRating);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user by ID (admin only)
router.get("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        store: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: {
                value: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate average rating for store owners
    if (user.role === "STORE_OWNER" && user.store) {
      const ratings = user.store.ratings;
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating.value, 0) /
            ratings.length
          : 0;

      user.rating = parseFloat(avgRating.toFixed(1));
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new user (admin only)
router.post("/", authenticate, isAdmin, validateUser, async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

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
        role: role || "USER",
      },
    });

    // Return user data without password
    const { password: _, ...userData } = user;
    res.status(201).json(userData);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server error during user creation" });
  }
});

// Update a user (admin only)
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({ message: "Email is already taken" });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(address && { address }),
        ...(role && { role }),
      },
    });

    // Return user data without password
    const { password: _, ...userData } = updatedUser;
    res.json(userData);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error during user update" });
  }
});

// Delete a user (admin only)
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error during user deletion" });
  }
});

module.exports = router;
