const express = require("express");
const prisma = require("../prisma/client");
const { authenticate, isAdmin, isStoreOwner } = require("../middleware/auth");

const router = express.Router();

// Admin dashboard stats
router.get("/admin", authenticate, isAdmin, async (req, res) => {
  try {
    // Get total counts
    const userCount = await prisma.user.count();
    const storeCount = await prisma.store.count();
    const ratingCount = await prisma.rating.count();

    // Get user counts by role
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    const normalUserCount = await prisma.user.count({
      where: { role: "USER" },
    });

    const storeOwnerCount = await prisma.user.count({
      where: { role: "STORE_OWNER" },
    });

    // Get average rating across all stores
    const ratings = await prisma.rating.findMany({
      select: { value: true },
    });

    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating.value, 0) /
          ratings.length
        : 0;

    // Get recent ratings
    const recentRatings = await prisma.rating.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json({
      totalUsers: userCount,
      totalStores: storeCount,
      totalRatings: ratingCount,
      adminUsers: adminCount,
      normalUsers: normalUserCount,
      storeOwners: storeOwnerCount,
      averageRating: parseFloat(avgRating.toFixed(1)),
      recentRatings,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Store owner dashboard
router.get("/store-owner", authenticate, isStoreOwner, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get store info
    const store = await prisma.store.findUnique({
      where: { ownerId: userId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!store) {
      return res
        .status(404)
        .json({ message: "Store not found for this owner" });
    }

    // Calculate average rating
    const ratings = store.ratings;
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating.value, 0) /
          ratings.length
        : 0;

    // Count ratings by value (1-5)
    const ratingCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    ratings.forEach((rating) => {
      ratingCounts[rating.value]++;
    });

    res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      ratingStats: {
        totalRatings: ratings.length,
        averageRating: parseFloat(avgRating.toFixed(1)),
        ratingCounts,
      },
      recentRatings: ratings.slice(0, 5),
    });
  } catch (error) {
    console.error("Store owner dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
