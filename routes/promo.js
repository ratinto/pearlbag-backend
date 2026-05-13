import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { serializePromo } from "../lib/serialize.js";

const router = Router();

// POST /api/promo/validate  body: { code, subtotal? }
router.post("/validate", async (req, res, next) => {
  try {
    const { code, subtotal } = req.body || {};
    if (!code) return res.status(400).json({ ok: false, message: "Code is required" });

    const promo = await prisma.promoCode.findUnique({
      where: { code: String(code).toUpperCase() },
    });

    if (!promo || !promo.active) {
      return res.status(404).json({ ok: false, message: "Invalid code" });
    }
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return res.status(400).json({ ok: false, message: "Code expired" });
    }
    const minOrder = Number(promo.minOrder);
    if (minOrder > 0 && Number(subtotal || 0) < minOrder) {
      return res.status(400).json({
        ok: false,
        message: `Minimum order $${minOrder.toFixed(0)} required`,
      });
    }

    res.json({ ok: true, promo: serializePromo(promo) });
  } catch (err) {
    next(err);
  }
});

export default router;
