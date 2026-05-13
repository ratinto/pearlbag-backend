import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { serializeReview } from "../lib/serialize.js";

const router = Router();

// GET /api/reviews/:productId
router.get("/:productId", async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    if (!Number.isInteger(productId)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ reviews: reviews.map(serializeReview) });
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews  body: { productId, authorName, rating, title?, body? }
router.post("/", async (req, res, next) => {
  try {
    const { productId, authorName, rating, title, body } = req.body || {};
    const pid = Number(productId);
    const r = Number(rating);

    if (!Number.isInteger(pid)) return res.status(400).json({ error: "Invalid productId" });
    if (!authorName || typeof authorName !== "string") {
      return res.status(400).json({ error: "authorName is required" });
    }
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      return res.status(400).json({ error: "rating must be an integer 1-5" });
    }

    const product = await prisma.product.findUnique({ where: { id: pid } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: { productId: pid, authorName: authorName.trim(), rating: r, title, body },
      });

      const stats = await tx.review.aggregate({
        where: { productId: pid },
        _avg: { rating: true },
        _count: { _all: true },
      });

      await tx.product.update({
        where: { id: pid },
        data: {
          rating: stats._avg.rating ?? 0,
          reviewCount: stats._count._all,
        },
      });

      return created;
    });

    res.status(201).json({ review: serializeReview(review) });
  } catch (err) {
    next(err);
  }
});

export default router;
