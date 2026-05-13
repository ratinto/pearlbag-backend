import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { serializeProduct } from "../lib/serialize.js";

const router = Router();

// GET /api/products?category=tote&q=mini&minPrice=100&maxPrice=300&inStock=true
router.get("/", async (req, res, next) => {
  try {
    const { category, q, minPrice, maxPrice, inStock, sort } = req.query;
    const where = {};

    if (category) where.category = String(category);
    if (q) where.name = { contains: String(q), mode: "insensitive" };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    if (inStock === "true") where.stock = { gt: 0 };

    const orderBy = (() => {
      switch (sort) {
        case "price-asc": return { price: "asc" };
        case "price-desc": return { price: "desc" };
        case "rating": return { rating: "desc" };
        case "newest": return { createdAt: "desc" };
        default: return { id: "asc" };
      }
    })();

    const products = await prisma.product.findMany({ where, orderBy });
    res.json({ products: products.map(serializeProduct) });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product: serializeProduct(product) });
  } catch (err) {
    next(err);
  }
});

export default router;
