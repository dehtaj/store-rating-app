const express = require("express");
const prisma = require("../prisma/client");
const { authenticate, isAdmin } = require("../middleware/auth");
const { validateStore } = require("../middleware/validation");

const router = express.Router();

// Get all stores
router.get("/", async (req, res) => {
  try {
    const { name, address } = req.query;

    // Build filter object based on query parameters
    const filter = {};

    if (name) filter.name = { contains: name, mode: "insensitive" };
    if (address) filter.address = { contains: address, mode: "insensitive" };

    const stores = await prisma.store.findMany({
      where: filter,
      include: {
        ratings: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Calculate average rating for each store
    const storesWithRating = stores.map((store) => {
      const ratings = store.ratings;
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating.value, 0) /
            ratings.length
          : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        rating: parseFloat(avgRating.toFixed(1)),
        ratingCount: ratings.length,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      };
    });

    res.json(storesWithRating);
  } catch (error) {
    console.error("Get stores error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get store by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        ratings: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Calculate average rating
    const ratings = store.ratings;
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating.value, 0) /
          ratings.length
        : 0;

    const storeWithRating = {
      ...store,
      rating: parseFloat(avgRating.toFixed(1)),
      ratingCount: ratings.length,
    };

    res.json(storeWithRating);
  } catch (error) {
    console.error("Get store error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get store with user's rating
router.get("/:id/user-rating", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        ratings: true,
      },
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Calculate average rating
    const ratings = store.ratings;
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating.value, 0) /
          ratings.length
        : 0;

    // Find user's rating
    const userRating = ratings.find((rating) => rating.userId === userId);

    const storeWithRating = {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      rating: parseFloat(avgRating.toFixed(1)),
      ratingCount: ratings.length,
      userRating: userRating ? userRating.value : null,
      userRatingId: userRating ? userRating.id : null,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    };

    res.json(storeWithRating);
  } catch (error) {
    console.error("Get store with user rating error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new store (admin only)
router.post("/", authenticate, isAdmin, validateStore, async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Check if store already exists with this email
    const existingStore = await prisma.store.findUnique({
      where: { email },
    });

    if (existingStore) {
      return res
        .status(400)
        .json({ message: "Store already exists with this email" });
    }

    // If ownerId is provided, check if user exists and is a STORE_OWNER
    if (ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: ownerId },
      });

      if (!owner) {
        return res.status(404).json({ message: "Owner not found" });
      }

      // Update user role to STORE_OWNER if not already
      if (owner.role !== "STORE_OWNER") {
        await prisma.user.update({
          where: { id: ownerId },
          data: { role: "STORE_OWNER" },
        });
      }
    }

    // Create store
    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ...(ownerId && { ownerId }),
      },
    });

    res.status(201).json(store);
  } catch (error) {
    console.error("Create store error:", error);
    res.status(500).json({ message: "Server error during store creation" });
  }
});

// Update a store (admin only)
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, ownerId } = req.body;

    // Check if store exists
    const existingStore = await prisma.store.findUnique({
      where: { id },
    });

    if (!existingStore) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Check if email is already taken by another store
    if (email && email !== existingStore.email) {
      const emailExists = await prisma.store.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({ message: "Email is already taken" });
      }
    }

    // If changing owner, update previous owner's role if they don't own any other stores
    if (ownerId && existingStore.ownerId && ownerId !== existingStore.ownerId) {
      const previousOwner = await prisma.user.findUnique({
        where: { id: existingStore.ownerId },
        include: {
          store: true,
        },
      });

      if (previousOwner && !previousOwner.store) {
        await prisma.user.update({
          where: { id: existingStore.ownerId },
          data: { role: "USER" },
        });
      }
    }

    // If new owner, update their role to STORE_OWNER
    if (ownerId && ownerId !== existingStore.ownerId) {
      const newOwner = await prisma.user.findUnique({
        where: { id: ownerId },
      });

      if (!newOwner) {
        return res.status(404).json({ message: "New owner not found" });
      }

      if (newOwner.role !== "STORE_OWNER") {
        await prisma.user.update({
          where: { id: ownerId },
          data: { role: "STORE_OWNER" },
        });
      }
    }

    // Update store
    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(address && { address }),
        ...(ownerId && { ownerId }),
      },
    });

    res.json(updatedStore);
  } catch (error) {
    console.error("Update store error:", error);
    res.status(500).json({ message: "Server error during store update" });
  }
});

// Delete a store (admin only)
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if store exists
    const existingStore = await prisma.store.findUnique({
      where: { id },
      include: {
        ratings: true,
      },
    });

    if (!existingStore) {
      return res.status(404).json({ message: "Store not found" });
    }

    // If store has an owner, update their role if they don't own any other stores
    if (existingStore.ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: existingStore.ownerId },
      });

      if (owner && owner.role === "STORE_OWNER") {
        await prisma.user.update({
          where: { id: existingStore.ownerId },
          data: { role: "USER" },
        });
      }
    }

    // Delete store (cascade will delete ratings)
    await prisma.store.delete({
      where: { id },
    });

    res.json({ message: "Store deleted successfully" });
  } catch (error) {
    console.error("Delete store error:", error);
    res.status(500).json({ message: "Server error during store deletion" });
  }
});

module.exports = router;
