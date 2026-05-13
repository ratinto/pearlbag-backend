import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/newsletter  body: { email }
router.post("/", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    res.status(201).json({
      subscriber: { ...subscriber, id: subscriber.id.toString() },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
