import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { computeTotals, generateOrderNumber } from "../lib/pricing.js";
import { serializeOrder } from "../lib/serialize.js";

const router = Router();

// POST /api/orders
// body: {
//   email, items: [{ productId, quantity, color? }],
//   promoCode?, shippingMethod?, paymentMethod?,
//   shippingAddress, billingAddress?
// }
router.post("/", async (req, res, next) => {
  try {
    const {
      email,
      items,
      promoCode,
      shippingMethod = "standard",
      paymentMethod = "card",
      shippingAddress,
      billingAddress,
    } = req.body || {};

    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "At least one item is required" });
    }
    if (!shippingAddress) return res.status(400).json({ error: "Shipping address is required" });

    const productIds = [...new Set(items.map((i) => Number(i.productId)))];
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItemsData = [];
    for (const item of items) {
      const product = productMap.get(Number(item.productId));
      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      if (product.stock < quantity) {
        return res.status(409).json({
          error: `Insufficient stock for ${product.name}`,
          productId: product.id,
          available: product.stock,
        });
      }
      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;
      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        colorName: item.color || null,
        unitPrice,
        quantity,
        lineTotal,
      });
    }

    let promo = null;
    if (promoCode) {
      promo = await prisma.promoCode.findUnique({
        where: { code: String(promoCode).toUpperCase() },
      });
      if (!promo || !promo.active) {
        return res.status(400).json({ error: "Invalid promo code" });
      }
      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Promo code expired" });
      }
      if (Number(promo.minOrder) > subtotal) {
        return res.status(400).json({
          error: `Minimum order $${Number(promo.minOrder).toFixed(0)} required for this code`,
        });
      }
    }

    const totals = computeTotals({ subtotal, promo, shippingMethod });
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          email,
          subtotal: totals.subtotal,
          discount: totals.discount,
          shipping: totals.shipping,
          tax: totals.tax,
          total: totals.total,
          promoCode: promo?.code ?? null,
          shippingMethod,
          paymentMethod,
          shippingAddress,
          billingAddress: billingAddress ?? shippingAddress,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });

      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    res.status(201).json({ order: serializeOrder(order) });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:orderNumber
router.get("/:orderNumber", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ order: serializeOrder(order) });
  } catch (err) {
    next(err);
  }
});

export default router;
