# Shopping Waze — Smart Grocery Shopping System

A web application for smart grocery management: scan a receipt, build a shared price database, compare prices across supermarket chains — and save money on every shop.

---

## Key Features

| Feature | Description |
|---|---|
| **Receipt Scanning** | Upload an image or capture directly from the camera |
| **Hebrew OCR (Gemini AI)** | Automatically extract products and prices from Hebrew receipts |
| **Shared Price Catalog** | Every scanned receipt feeds the global MySQL catalog — available to all users |
| **Cart Management** | Add, update, remove items, or clear the entire cart |
| **Price Comparison** | Compare the cart across all known supermarket chains in the database |
| **Popular Products** | Dashboard widget showing most-purchased products from cart history |
| **User Authentication** | Registration, login and secure JWT session management |

---

## Architecture

The application consists of three independent services:

```
┌──────────────────────────────────────────────────────┐
│                  Browser (React)                      │
│          Vite + React 19 + Tailwind CSS 4             │
│                PORT: 5173                             │
└─────────────┬────────────────────┬────────────────────┘
              │                    │
              ▼                    ▼
┌─────────────────────┐  ┌──────────────────────────────┐
│  server_auth        │  │  backend_server               │
│  Node.js + Express  │  │  Python + FastAPI             │
│  MongoDB            │  │  MySQL 8 + Google Gemini AI   │
│  PORT: 5000         │  │  PORT: 8000                   │
└─────────────────────┘  └──────────────────────────────┘
```

| Layer | Technology | Responsibility |
|---|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS 4, React Router 7 | UI, state management |
| **Auth Server** | Node.js, Express 4, MongoDB, JWT, bcryptjs | Users, login/register, cart, popular products |
| **Backend Server** | Python 3.11, FastAPI, SQLAlchemy 2, MySQL 8, Gemini AI | Receipt OCR, price catalog, cross-store comparison |

---

## Folder Structure

```
Shoping-Waze/
├── client/                         # Frontend (React + Vite)
│   ├── src/
│   │   ├── Pages/                  # AuthPage, Dashboard, CartPage, ScanPage,
│   │   │                           #   ReceiptDetailsPage, CompareResultsPage
│   │   ├── Comps/                  # Auth, Cart, Dashboard, Scan components
│   │   ├── hooks/                  # useAuth, useCart, useCompare,
│   │   │                           #   useCameraCapture, useProducts, usePopularProducts
│   │   ├── Contexts/               # AuthContext (JWT + session)
│   │   └── Pages/__tests__/        # Vitest tests
│   ├── .env.example
│   └── vite.config.js
│
├── server_auth/                    # Auth + Cart server (Node.js + Express)
│   ├── controllers/                # authController, cartController, productsController
│   ├── models/                     # User (MongoDB schema)
│   ├── routes/                     # auth, cart, products
│   ├── middleware/                 # auth.js (JWT protect)
│   ├── db/                         # MongoDB client
│   └── .env.example
│
└── backend_server/                 # Data + AI server (Python + FastAPI)
    ├── app/
    │   ├── api/                    # receipt_routes, basket_routes, products_routes
    │   ├── services/               # OCRService, ReceiptService, BasketService
    │   ├── models/                 # Product, Store, PriceHistory (SQLAlchemy ORM)
    │   ├── schemas/                # Pydantic schemas
    │   └── core/                   # config, constants, enums, utils
    ├── migrations/                 # Alembic migrations
    ├── tests/                      # pytest tests
    ├── dockerfile
    ├── docker-compose.yml          # MySQL 8 service
    └── .env.example
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB running locally or via Atlas
- MySQL 8 running locally or via Docker
- Google Gemini API key

---

### 1. Frontend (`client`)

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Runs at: `http://localhost:5173`

**Environment variables:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_DATA_API_URL=http://localhost:8000
```

---

### 2. Auth Server (`server_auth`)

```bash
cd server_auth
cp .env.example .env
npm install
node index.js
```

Runs at: `http://localhost:5000`

**Environment variables:**
```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=shopping_waze
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

### 3. Backend Server (`backend_server`)

**Start MySQL with Docker (recommended):**
```bash
cd backend_server
docker-compose up -d
```

**Run the Python server:**
```bash
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Alembic migrations run **automatically** on startup. To run them manually:
```bash
alembic upgrade head
```

Runs at: `http://localhost:8000`  
Interactive API docs: `http://localhost:8000/docs`

**Environment variables:**
```env
SQLALCHEMY_DATABASE_URL=mysql+pymysql://user:password@localhost:3306/shopping_waze
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL_NAME=gemini-2.0-flash
CORS_ALLOW_ORIGINS=http://localhost:5173
CREATE_TABLES_ON_STARTUP=false
LOG_LEVEL=INFO
```

> **Note on Gemini model:** Use a stable model such as `gemini-2.0-flash`. Preview models are limited to 2–5 RPM on the free tier, which causes OCR failures on repeated scans.

---

## API Reference

### Backend (FastAPI) — `http://localhost:8000`

| Method | Path | Description |
|---|---|---|
| `POST` | `/receipts/upload` | Upload a receipt image → OCR → save to MySQL |
| `POST` | `/basket/compare` | Compare the cart across all known store chains |
| `GET` | `/products` | List products with average price (search: `?q=`) |

> Products are always saved to the global catalog. Prices are only stored when the store name is recognized (not `Unknown`).

---

### Auth Server (Express) — `http://localhost:5000/api`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Server health check |
| `POST` | `/auth/register` | — | Register a new user |
| `POST` | `/auth/login` | — | Login and receive JWT |
| `GET` | `/auth/me` | JWT | Current user info |
| `GET` | `/products` | JWT | Product list (MongoDB) |
| `GET` | `/products/popular` | JWT | Popular products from cart history |
| `GET` | `/cart` | JWT | Fetch current cart |
| `POST` | `/cart` | JWT | Add items to cart (merged with existing) |
| `PATCH` | `/cart/:name` | JWT | Update item quantity or price |
| `DELETE` | `/cart/:name` | JWT | Remove a single item from cart |
| `DELETE` | `/cart` | JWT | **Clear the entire cart** (does not affect the global product catalog) |
| `PUT` | `/cart/store` | JWT | Update preferred store |

---

## Data Flow

```
User scans a receipt
        │
        ▼
  ScanPage (React)
        │  POST /receipts/upload
        ▼
  FastAPI + Gemini AI
        │  ├── Extract products and prices from image
        │  ├── Save products to MySQL (always)
        │  └── Save prices to MySQL (only if store name is recognized)
        ▼
  ReceiptDetailsPage (React)
        │  POST /api/cart
        ▼
  MongoDB (user's cart)

Price comparison flow:
  CartPage → POST /basket/compare → FastAPI
        │  ├── Fetch all known stores from MySQL
        │  ├── Filter out unknown stores (e.g. "Unknown")
        │  └── Calculate basket total per store
        ▼
  CompareResultsPage (sorted cheapest first)
```

---

## Testing

```bash
# Frontend
cd client
npm run test        # Vitest — all tests
npm run lint        # ESLint check
npm run build       # Verify production build

# Backend
cd backend_server
pytest tests/ -v    # 23 pytest tests
```

---

## Deployment

| Component | Recommended Platforms |
|---|---|
| **Frontend** | Vercel / Netlify / Render — `npm run build` → deploy `dist/` |
| **Backend (FastAPI)** | Render / Railway — `dockerfile` included |
| **Auth Server** | Render / Railway — `node index.js` |
| **MySQL** | PlanetScale / Railway / Render Managed DB |
| **MongoDB** | MongoDB Atlas |

### Notes for Render (free tier)

- Free-tier services spin down after 15 minutes of inactivity. The first request after sleep takes 15–30 seconds (cold start).
- The OCR endpoint runs Gemini in `asyncio.to_thread` so it does not block the FastAPI event loop.
- Set `GEMINI_MODEL_NAME` to a stable model (not a preview) to avoid hitting low Gemini free-tier rate limits.
