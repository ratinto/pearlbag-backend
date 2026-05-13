import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/contact  body: { email, name?, subject?, message }
router.post("/", async (req, res, next) => {
  try {
    const { email, name, subject, message } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanMessage = String(message || "").trim();

    if (!EMAIL_RE.test(cleanEmail)) {
      return res.status(400).json({ error: "Valid email is required" });
    }
    if (cleanMessage.length < 5) {
      return res.status(400).json({ error: "Message is too short" });
    }

    const saved = await prisma.contactMessage.create({
      data: {
        email: cleanEmail,
        name: name?.trim() || null,
        subject: subject?.trim() || null,
        message: cleanMessage,
      },
    });

    res.status(201).json({ message: { ...saved, id: saved.id.toString() } });
  } catch (err) {
    next(err);
  }
});

export default router;
