import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import promoRouter from "./routes/promo.js";
import reviewsRouter from "./routes/reviews.js";
import newsletterRouter from "./routes/newsletter.js";
import contactRouter from "./routes/contact.js";

dotenv.config();

const app = express();

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
  : "*";

app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.send("Pearlbag Backend Running");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API working successfully" });
});

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/promo", promoRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/contact", contactRouter);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, req, res, _next) => {
  console.error(err);
  if (err.code === "P2002") {
    return res.status(409).json({ error: "Resource already exists" });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Resource not found" });
  }
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
