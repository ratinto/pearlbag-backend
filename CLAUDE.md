# Pearlbag Backend — Context

Minimal Express API that powers the Pearlbag Boutique ecommerce frontend.

## Stack

- **Runtime:** Node.js, ES modules (`"type": "module"` in package.json)
- **Server:** Express 5
- **Middleware:** `cors`, `express.json`, `dotenv`
- **Entry point:** `server.js`

## Layout

```
pearlbag-backend/
├── server.js        # express app + routes
├── package.json
├── .gitignore
└── README.md
```

There are no `src/`, `routes/`, `controllers/`, or `models/` folders yet — every route lives directly inside `server.js`. Add structure only when route count makes the single file unwieldy.

## Running

```bash
npm install
node server.js          # listens on PORT (default 5000)
```

Configure `PORT` via a `.env` file (loaded by `dotenv`). No build step.

## Current routes

| Method | Path        | Behavior                                      |
| ------ | ----------- | --------------------------------------------- |
| GET    | `/`         | Returns plain text "Pearlbag Backend Running" |
| GET    | `/api/test` | Returns `{ message: "API working successfully" }` |

CORS is permissive (`app.use(cors())`) — fine for local dev with the Vite frontend, tighten before production.

## Frontend integration

The frontend lives in a sibling directory `../pearlbag-frontend` and currently does **not** call this API. All product data, cart, wishlist, and order state lives in the frontend (`src/data/handbags.js` + `localStorage`). When wiring real persistence/auth, this backend is the place to add it.

## Conventions

- ES module syntax (`import`/`export`)
- Use the existing dependencies before adding new ones
- Keep route handlers small; extract into a `routes/` folder once there are more than a handful
- Read configuration from `process.env` via `dotenv`; do not commit secrets
