const express = require("express");
const prisma = require("../prisma/client");
const { authenticate } = require("../middleware/auth");
const { validateRating } = require("../middleware/validation");

const router = express.Router();

// Submit a rating
router.post("/", authenticate, validateRating, async (req, res) => {
  try {
    const { storeId, value } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Check if user has already rated this store
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (existingRating) {
      return res.status(400).json({
        message:
          "You have already rated this store. Use PUT to update your rating.",
      });
    }

    // Create rating
    const rating = await prisma.rating.create({
      data: {
        value,
        userId,
        storeId,
      },
    });

    res.status(201).json(rating);
  } catch (error) {
    console.error("Submit rating error:", error);
    res.status(500).json({ message: "Server error during rating submission" });
  }
});

// Update a rating
router.put("/:id", authenticate, validateRating, async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    const userId = req.user.id;

    // Check if rating exists and belongs to the user
    const existingRating = await prisma.rating.findUnique({
      where: { id },
    });

    if (!existingRating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    if (existingRating.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own ratings" });
    }

    // Update rating
    const updatedRating = await prisma.rating.update({
      where: { id },
      data: { value },
    });

    res.json(updatedRating);
  } catch (error) {
    console.error("Update rating error:", error);
    res.status(500).json({ message: "Server error during rating update" });
  }
});

// Delete a rating
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if rating exists and belongs to the user
    const existingRating = await prisma.rating.findUnique({
      where: { id },
    });

    if (!existingRating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    if (existingRating.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own ratings" });
    }

    // Delete rating
    await prisma.rating.delete({
      where: { id },
    });

    res.json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error("Delete rating error:", error);
    res.status(500).json({ message: "Server error during rating deletion" });
  }
});

// Get ratings for a store
router.get("/store/:storeId", async (req, res) => {
  try {
    const { storeId } = req.params;

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Get ratings with user info
    const ratings = await prisma.rating.findMany({
      where: { storeId },
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
    });

    res.json(ratings);
  } catch (error) {
    console.error("Get store ratings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's rating for a store
router.get("/user/:userId/store/:storeId", authenticate, async (req, res) => {
  try {
    const { userId, storeId } = req.params;

    // Only allow users to get their own ratings or admins to get any rating
    if (userId !== req.user.id && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "You can only view your own ratings" });
    }

    // Get rating
    const rating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    res.json(rating);
  } catch (error) {
    console.error("Get user rating error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all ratings
router.get("/", async (req, res) => {
  try {
    const ratings = await prisma.rating.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(ratings);
  } catch (error) {
    console.error("Get all ratings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
