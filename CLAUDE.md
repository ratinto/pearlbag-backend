# Pearlbag Backend — Context

Express API backed by **Supabase Postgres via Prisma**. Powers the Pearlbag Boutique storefront in `../pearlbag-frontend`.

## Stack

- **Runtime:** Node.js, ES modules (`"type": "module"` in package.json)
- **Server:** Express 5
- **ORM:** Prisma 5 (`@prisma/client`) targeting Supabase Postgres
- **Middleware:** `cors`, `express.json`, `dotenv`
- **Entry point:** `server.js`

## Layout

```
pearlbag-backend/
├── server.js               # express app, route mounts, error handler
├── lib/
│   ├── prisma.js           # PrismaClient singleton (avoid HMR connection storms)
│   ├── pricing.js          # SHIPPING_COST, FREE_SHIPPING_THRESHOLD, computeTotals(), generateOrderNumber()
│   └── serialize.js        # serializeProduct/Promo/Order/Review — coerce Decimal -> Number, BigInt -> string
├── routes/
│   ├── products.js         # GET /api/products (filter/sort), GET /api/products/:id
│   ├── orders.js           # POST /api/orders (transactional), GET /api/orders/:orderNumber
│   ├── promo.js            # POST /api/promo/validate
│   ├── reviews.js          # GET /api/reviews/:productId, POST /api/reviews (recomputes product avg)
│   ├── newsletter.js       # POST /api/newsletter (idempotent upsert)
│   └── contact.js          # POST /api/contact
├── prisma/
│   ├── schema.prisma       # models: Product, PromoCode, Order, OrderItem, Review, NewsletterSubscriber, ContactMessage
│   └── seed.js             # 9 handbags + 4 promo codes
├── .env.example
├── package.json
└── README.md
```

## Database — Supabase + Prisma

Connection strings live in `.env` (see `.env.example`):

- `DATABASE_URL` — **pooled** (port 6543, `pgbouncer=true`). Used by the app at runtime.
- `DIRECT_URL` — **direct** (port 5432). Used by Prisma for migrations.

Both come from Supabase project → Project Settings → Database → Connection string. Never commit `.env`.

### Models

All models map to snake_case tables via `@@map`. Decimal columns use `Decimal(10, 2)`.

- `Product` (`products`) — catalog. `colors` and `details` are JSON / `text[]`. `rating` + `reviewCount` denormalized; updated by review writes.
- `PromoCode` (`promo_codes`) — `code` is PK. `type` enum: `percent | fixed | shipping`. Server is source of truth.
- `Order` (`orders`) — UUID PK, `orderNumber` is the human-readable code (e.g. `PB-XXXXX-XXXX`). `shippingAddress`/`billingAddress` are JSON.
- `OrderItem` (`order_items`) — denormalized name + unitPrice so historic orders stay correct if products change.
- `Review` (`reviews`) — write triggers a recompute of `Product.rating` and `Product.reviewCount` inside the same transaction.
- `NewsletterSubscriber` (`newsletter_subscribers`) — unique email, idempotent upsert.
- `ContactMessage` (`contact_messages`) — free-form inquiries.

## Running

```bash
npm install
cp .env.example .env                 # fill DATABASE_URL + DIRECT_URL
npx prisma migrate dev --name init   # create tables
npm run db:seed                      # seed products + promo codes
npm run dev                          # node --watch server.js
```

Scripts (`package.json`):

- `npm start` / `npm run dev` — run server (dev uses `--watch`)
- `npm run prisma:generate` — regenerate client after schema change
- `npm run prisma:migrate` — create + apply a dev migration
- `npm run prisma:deploy` — apply migrations in prod
- `npm run prisma:studio` — open Prisma Studio
- `npm run db:seed` — run `prisma/seed.js`

After any change to `prisma/schema.prisma`, run `npm run prisma:migrate` (dev) and the client regenerates automatically.

## Routes

| Method | Path                          | Behavior                                                                 |
| ------ | ----------------------------- | ------------------------------------------------------------------------ |
| GET    | `/`                           | Plain text health check                                                  |
| GET    | `/api/test`                   | `{ message: "API working successfully" }`                                |
| GET    | `/api/products`               | List with `?category=&q=&minPrice=&maxPrice=&inStock=true&sort=`         |
| GET    | `/api/products/:id`           | Single product                                                           |
| POST   | `/api/orders`                 | Create order (stock check + decrement + totals recomputed server-side)   |
| GET    | `/api/orders/:orderNumber`    | Single order with items                                                  |
| POST   | `/api/promo/validate`         | `{ ok, promo? }` — validates code against optional `subtotal`            |
| GET    | `/api/reviews/:productId`     | Reviews for a product                                                    |
| POST   | `/api/reviews`                | Add review; recomputes product avg + reviewCount                         |
| POST   | `/api/newsletter`             | Idempotent email upsert                                                  |
| POST   | `/api/contact`                | Save contact message                                                     |

### Important invariants

- **Totals are recomputed server-side.** `POST /api/orders` never trusts price/discount/total from the client. It looks up product prices, validates the promo, and computes via `lib/pricing.js → computeTotals()`. The client's totals are display-only.
- **Order creation runs in a `prisma.$transaction`** — stock check, order insert, item inserts, and stock decrement are atomic. A failure mid-way rolls back.
- **Decimal serialization.** Prisma serializes `Decimal` columns to strings, and BigInt PKs aren't JSON-safe. Always pass DB rows through `lib/serialize.js` before responding so the frontend can do arithmetic on numbers.
- **Prisma error mapping** in `server.js`: `P2002` → 409, `P2025` → 404. Add new mappings here rather than per-route.
- **CORS** is permissive by default (`*`). Set `CORS_ORIGINS=https://a.com,https://b.com` in `.env` to lock it down.

## Conventions

- ES module syntax (`import`/`export`)
- Use the existing dependencies before adding new ones; Prisma is the only ORM
- Keep route handlers small; if a route grows beyond a screen, extract a service module under `lib/`
- Read configuration from `process.env` via `dotenv`; do not commit secrets
- New models/fields go in `prisma/schema.prisma` then `npm run prisma:migrate -- --name <change>`; never hand-edit migrations after they're applied
- When you add a new HTTP-facing field that's a Decimal or BigInt, also update the matching serializer in `lib/serialize.js`
