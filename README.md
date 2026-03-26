# Shopping Waze — Smart Receipts (קבלות חכמות)

Full-stack web app for smart grocery shopping: **Hebrew receipt scanning** with AI, personal cart, **price comparison** across supermarket chains, **shared carts** with invite codes, scan history, user profile, **trust score** based on verified activity, and community feedback reports.

The UI is **Hebrew (RTL)** and built with **React**.

> **Documentation language:** This file is the **primary** README (English). A Hebrew version is available in [`README.he.md`](README.he.md).

---

## Table of contents

1. [Architecture](#architecture)
2. [Key features](#key-features)
3. [Repository layout](#repository-layout)
4. [Routing, headers & SPA](#routing-headers--spa)
5. [Trust score & reports](#trust-score--reports)
6. [Local development](#local-development)
7. [Environment variables](#environment-variables)
8. [API — Auth server (Express)](#api--auth-server-express)
9. [API — Data server (FastAPI)](#api--data-server-fastapi)
10. [Data flows](#data-flows)
11. [Production deployment](#production-deployment)
12. [Testing & quality](#testing--quality)

---

## Architecture

Three main components:

| Layer | Stack | Role |
|--------|--------|------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Router 7 | UI, client-side routing, cart templates in `localStorage` |
| **server_auth** | Node.js, Express 4, MongoDB, JWT, bcryptjs | Users, personal cart, shared carts, scan history, popular products, reports, trust score |
| **backend_server** | Python, FastAPI, SQLAlchemy 2, MySQL 8, Google Gemini | Receipt OCR, global product catalog, basket price comparison |

```
┌─────────────────────────┐
│   Browser (React+Vite)  │
│   default :5173         │
└───────────┬─────────────┘
            │  VITE_API_URL          VITE_DATA_API_URL
            ▼                        ▼
┌───────────────────┐    ┌──────────────────────┐
│  server_auth      │    │  backend_server      │
│  Express + Mongo  │    │  FastAPI + MySQL     │
│  :5000 /api       │    │  :8000               │
└───────────────────┘    └──────────────────────┘
```

---

## Key features

### Receipt scanning
- Gallery upload or camera; **multi-photo** (up to 8) stitched into one **JPEG** via Canvas before upload.
- **Single-file pipeline** also normalizes to JPEG — works well with **iPhone** (JPEG / HEIC after browser decode).
- **Brightness check** before upload; clear errors (size, format, server, timeout).
- **Gemini** OCR in Hebrew; edit line items before approve → add to cart.

### Personal cart
- Catalog or manual add; quantities, sort, debounced search.
- **Inline rename** of cart items (no delete-and-readd).
- Cart **templates** (`localStorage`), **CSV export** with UTF-8 BOM for Hebrew, sticky footer totals.

### Price comparison
- Compare cart against **known** chains in DB; unknown store names filtered out.

### Shared carts
- Create cart, **invite code**, join; add/update/remove items; **auto-refresh ~15s**.
- **Collapsible product picker** (same pattern as personal cart) — not a permanent two-column split.

### Dashboard
- Four clear sections: scan receipt, my carts (personal + shared), scan history, create shared cart.
- Popular products from history; first-visit onboarding.
- **Share the app** with friends (Web Share API on mobile; WhatsApp / email / copy link on desktop).

### Navigation & mobile
- **AppLayout** with sticky **AppHeader** on all authenticated routes.
- **NavDrawer** (hamburger) — links to main screens + logout.
- **Profile** (`/profile`): name, avatar color (initials), read-only email.
- Responsive tweaks (e.g. horizontal scroll for receipt line-items table).

### Trust score & reports
- Server-side **0–100 score**, tier labels (Hebrew in API), **stars**, driven by:
  - **`receiptsConfirmed`** — each successful `POST /api/history` after approving a receipt.
  - **`reportsSubmitted`** — each accepted `POST /api/reports`.
- Legacy users without `reputation`: **one-time bootstrap** on `GET /api/auth/me` from `scanHistory` count.
- Reports stored in **`userReports`**; **daily cap** to limit abuse.

### Auth & routing
- JWT in `localStorage`; `GET /auth/me` for session validation.
- Dedicated **404** page for unknown routes (inside authenticated layout).

### Browser chrome
- **`usePageTitle`** for per-route `<title>`.
- **Favicon** from `client/public/favicon.svg`.

---

## Repository layout

```
Shoping-Waze/
├── client/                      # Vite + React
│   ├── public/
│   │   ├── _redirects           # SPA fallback (Netlify / Render static)
│   │   └── favicon.svg
│   ├── src/
│   │   ├── App.jsx              # Routes, guards, protected layout
│   │   ├── main.jsx             # BrowserRouter, StrictMode
│   │   ├── layouts/AppLayout.jsx
│   │   ├── Comps/
│   │   │   ├── AppHeader.jsx
│   │   │   ├── NavDrawer.jsx    # Side nav + avatar
│   │   │   ├── SharePanel.jsx   # Share app / invite
│   │   │   ├── Auth/, Cart/, Dashboard/, Onboarding/, Scan/, …
│   │   ├── Pages/
│   │   │   ├── Dashboard.jsx, CartPage.jsx, ScanPage.jsx
│   │   │   ├── ReceiptDetailsPage.jsx, CompareResultsPage.jsx
│   │   │   ├── SharedCartListPage.jsx, SharedCartPage.jsx
│   │   │   ├── ScanHistoryPage.jsx, ProfilePage.jsx
│   │   │   ├── AuthPage.jsx, NotFoundPage.jsx
│   │   ├── Contexts/            # Auth, Toast
│   │   ├── hooks/
│   │   └── utils/exportCart.js
│   ├── vercel.json, nginx.conf
│   └── vite.config.js           # SPA, dev history fallback
│
├── server_auth/                 # Express + MongoDB
│   ├── controllers/             # auth, cart, sharedCart, history, products, reports
│   ├── models/User.js
│   ├── routes/
│   ├── middleware/auth.js
│   ├── utils/trustScore.js      # trust computation + toPublicUser
│   └── index.js                 # API + static React build from client/dist (if present)
│
├── backend_server/              # FastAPI + MySQL + Gemini
│   ├── app/api/                 # receipts, basket, products
│   ├── app/services/
│   ├── migrations/              # Alembic
│   ├── tests/
│   ├── docker-compose.yml
│   └── Dockerfile
│
├── render.yaml                  # Render: Node web + static site SPA rewrite
├── README.md                    # This file (English, primary)
└── README.he.md                 # Hebrew documentation
```

---

## Routing, headers & SPA

- **React Router** + `BrowserRouter` — real URLs (`/cart`, `/scan`, …).
- **Vite dev:** `appType: 'spa'` and config so deep links refresh return `index.html`.
- **Production:**
  - **Express** in `server_auth` serves `client/dist` and `GET *` → `index.html` for SPA.
  - **Static hosting** (e.g. Render static): require **`/*` → `/index.html` rewrite** (see `render.yaml`, `client/public/_redirects`).
  - Examples also in `vercel.json`, `nginx.conf`.

---

## Trust score & reports

- User documents store **`reputation`**:
  - `receiptsConfirmed` — incremented on each successful **`POST /api/history`**.
  - `reportsSubmitted` — incremented on each accepted **`POST /api/reports`**.
- API responses include computed **`trust`**: `score`, `level`, `levelLabel`, `stars`, and counters.
- **`userReports`** collection stores report payload; **per-day limit** on submissions.

---

## Local development

### Prerequisites

- Node.js 18+
- Python 3.11+ (or version compatible with the project)
- MongoDB (local or Atlas)
- MySQL 8 (local or Docker)
- **Google Gemini** API key for OCR

### 1. Frontend (`client`)

```bash
cd client
cp .env.example .env
# Set VITE_API_URL and VITE_DATA_API_URL
npm install
npm run dev
```

Default: `http://localhost:5173`

### 2. Auth server (`server_auth`)

```bash
cd server_auth
cp .env.example .env
# Set MONGO_URI, JWT_SECRET, DB_NAME, PORT, CLIENT_URL
npm install
npm run dev
# or: node index.js
```

Default: `http://localhost:5000` — API under `/api/...`

### 3. Data server (`backend_server`)

MySQL (example with Docker):

```bash
cd backend_server
docker compose up -d
```

Run FastAPI:

```bash
cp .env.example .env
# Set SQLALCHEMY_DATABASE_URL, GEMINI_API_KEY, CORS_ALLOW_ORIGINS
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Interactive docs: `http://localhost:8000/docs`

**Gemini tip:** Prefer a **stable** model (e.g. `gemini-2.0-flash`) — free-tier **preview** models often have very low RPM and cause OCR failures.

---

## Environment variables

### `client/.env`

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Express API base, e.g. `http://localhost:5000/api` |
| `VITE_DATA_API_URL` | FastAPI base, e.g. `http://localhost:8000` |

### `server_auth/.env`

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret for JWT signing |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `PORT` | Server port (default 5000) |
| `CLIENT_URL` | CORS origin for dev browser |

### `backend_server/.env`

| Variable | Description |
|----------|-------------|
| `SQLALCHEMY_DATABASE_URL` | MySQL URL (SQLAlchemy + pymysql) |
| `GEMINI_API_KEY` | API key |
| `GEMINI_MODEL_NAME` | Model id for OCR |
| `CORS_ALLOW_ORIGINS` | Comma-separated origins |
| `LOG_LEVEL`, `CREATE_TABLES_ON_STARTUP` | As needed |

In production, rebuild the client with **`VITE_*`** pointing at real API URLs.

---

## API — Auth server (Express)

Base: `http://localhost:5000/api` (or your deployed host).

### Auth & profile

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Register |
| POST | `/auth/login` | — | Login + JWT |
| GET | `/auth/me` | JWT | Current user + `trust` (bootstrap reputation if needed) |
| PUT | `/auth/me` | JWT | Update name, avatar color |

### Reports

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/reports` | JWT | Body: `type`, `message`, optional `context` |

Allowed `type` values are defined in server code (e.g. wrong price, missing product, bug, suggestion, other).

### Personal cart

| Method | Path | Description |
|--------|------|-------------|
| GET / POST / PATCH / DELETE | `/cart`, `/cart/:name` | Cart CRUD |

### Shared carts

| Method | Path | Description |
|--------|------|-------------|
| POST | `/shared-carts` | Create |
| GET | `/shared-carts` | List mine |
| POST | `/shared-carts/join` | Join with code |
| GET / PATCH / DELETE | `/shared-carts/:id`, `.../items/...` | Read / update items |
| DELETE | `/shared-carts/:id/leave` | Leave (non-owner) |
| DELETE | `/shared-carts/:id` | Delete (owner) |

### Scan history

| Method | Path | Description |
|--------|------|-------------|
| POST | `/history` | Save approved receipt (+ `receiptsConfirmed`) |
| GET | `/history` | Last 50 entries |
| DELETE | `/history/:id` | Delete entry |

### Products (Mongo)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | List / search |
| GET | `/products/popular` | Popular from history |

---

## API — Data server (FastAPI)

Base: `http://localhost:8000`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/receipts/upload` | Receipt image → OCR → persist per server rules |
| POST | `/basket/compare` | Price comparison for basket |
| GET | `/products` | Product list (`?q=` search) |
| POST | `/products` | Create product manually |

Products are always saved; price history rows depend on a **valid recognized store**.

---

## Data flows

**Scan:** Image(s) → `POST /receipts/upload` (FastAPI + Gemini) → edit in `ReceiptDetailsPage` → `POST /api/cart` + `POST /api/history` (Express) → MongoDB cart + history; client **refreshes user** to update trust.

**Compare:** Cart from Express → `POST /basket/compare` → sorted results.

**Shared cart:** MongoDB-backed; client **polls** periodically.

---

## Production deployment

- **Render** (`render.yaml`):
  - **Web service** — builds `client`, installs `server_auth`, runs `node server_auth/index.js`; serves API + SPA from `client/dist` with SPA fallback.
  - **Static site** — client build only; **must** configure `/*` → `/index.html` **rewrite** so refresh on `/cart` etc. does not 404.
- **Vercel / Netlify:** use `vercel.json` / `_redirects` under `client`.
- Use **MongoDB Atlas**, managed **MySQL**, and secrets (`JWT_SECRET`, `GEMINI_API_KEY`) in the host’s env — never in git.

Free tiers may **cold-start**; first request after idle can be slow.

---

## Testing & quality

```bash
# Frontend
cd client
npm run test      # Vitest
npm run lint      # ESLint
npm run build     # Production build check

# Backend
cd backend_server
pytest tests/ -v
```

---

## Summary

Shopping Waze combines a **Hebrew-first** shopping UX with **dual backends** (Mongo for app state & users, MySQL for catalog & prices), **Gemini** OCR, and **social** features (shared cart, sharing, trust, reports). Run all three services locally and align **`VITE_*`** with your real API URLs.

**Hebrew documentation:** [`README.he.md`](README.he.md)
