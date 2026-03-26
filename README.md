# My Waze — Smart Grocery Receipt Scanner

A smart web application for grocery shopping management. Upload a receipt image (or capture one directly with the camera), and the system automatically extracts products and prices using Google Gemini AI. Then compare your shopping basket across different store branches to find the best prices.

---

## Features

| Feature | Description |
|---|---|
| **Receipt Scanning** | Upload an image or capture directly from the camera |
| **AI-based OCR** | Automatic extraction of products and prices from Hebrew receipts using Gemini |
| **Cart Management** | Add, edit, and delete products in the cart |
| **Price Comparison** | Compare the basket against all stores in the database |
| **Price History** | Store product prices over time per branch |
| **Popular Products** | Display frequently used products on the dashboard |
| **User Authentication** | Registration, login, secure JWT sessions |

---

## Architecture

The application is split into three independent services:

```
┌─────────────────────────────────────────────────────┐
│               Browser (React)                        │
│          Vite + React 19 + Tailwind CSS 4            │
└────────────┬─────────────────────┬───────────────────┘
             │                     │
             ▼                     ▼
┌────────────────────┐   ┌─────────────────────────────┐
│  server_auth       │   │  backend_server              │
│  Node.js + Express │   │  Python + FastAPI            │
│  MongoDB           │   │  MySQL + Gemini AI           │
│  PORT: 5000        │   │  PORT: 8000                  │
└────────────────────┘   └─────────────────────────────┘
```

| Layer | Technology | Responsibility |
|---|---|---|
| **Frontend** | React 19, Vite 6, Tailwind CSS 4, React Router 7 | User interface |
| **Auth Server** | Node.js, Express 4, MongoDB, JWT, bcryptjs | Users, login, cart, popular products |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy 2, MySQL 8, Gemini AI | Receipt OCR, price comparison, product catalog |

---

## Folder Structure

```
my_waze/
├── client/                        # Frontend (React + Vite)
│   ├── src/
│   │   ├── Pages/                 # Auth, Dashboard, Cart, Scan, Details, Compare
│   │   ├── Comps/                 # Components: Auth, Cart, Dashboard, Scan
│   │   ├── hooks/                 # useAuth, useCart, useCompare, useCameraCapture
│   │   ├── Contexts/              # AuthContext
│   │   └── test/                  # setupTests.js
│   ├── .env.example
│   └── vite.config.js
│
├── server_auth/                   # Auth server (Node.js + Express)
│   ├── controllers/               # authController, cartController, productsController
│   ├── models/                    # User (MongoDB)
│   ├── routes/                    # auth, cart, products
│   ├── middleware/                # auth.js (JWT protect)
│   ├── db/                        # MongoDB client
│   └── .env.example
│
└── backend_server/                # Data server (Python + FastAPI)
    ├── app/
    │   ├── api/                   # receipt_routes, basket_routes, products_routes
    │   ├── services/              # OCRService (async), ReceiptService, BasketService
    │   ├── models/                # Product, Store, PriceHistory (SQLAlchemy)
    │   ├── schemas/               # Pydantic schemas
    │   └── core/                  # config, constants, enums, utils
    ├── migrations/                # Alembic migrations
    ├── dockerfile
    ├── docker-compose.yml
    └── .env.example
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB running locally (or Atlas)
- MySQL 8 running locally (or via Docker)
- Google Gemini API key

---

### 1. Frontend (client)

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

### 2. Auth Server (server_auth)

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
DB_NAME=my_waze
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

### 3. Backend Server (backend_server)

**With Docker (recommended for MySQL):**
```bash
cd backend_server
docker-compose up -d
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Migrations run automatically on startup via Alembic. To run them manually:
```bash
alembic upgrade head
```

**Environment variables:**
```env
SQLALCHEMY_DATABASE_URL=mysql+pymysql://user:password@localhost:3306/grocery_app
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL_NAME=gemini-2.0-flash
CORS_ALLOW_ORIGINS=http://localhost:5173
CREATE_TABLES_ON_STARTUP=false
LOG_LEVEL=INFO
```

Runs at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

> **Note on GEMINI_MODEL_NAME:** Use a stable model such as `gemini-2.0-flash`. Preview models (e.g. `gemini-*-preview`) have very restrictive rate limits on the free tier (2–5 RPM) which will cause OCR failures on repeated scans.

---

## API Endpoints

### Backend (FastAPI) — `http://localhost:8000`

| Method | Path | Description |
|---|---|---|
| `POST` | `/receipts/upload` | Upload receipt image for OCR extraction |
| `POST` | `/basket/compare` | Compare shopping basket across stores |
| `GET` | `/products` | List products with optional search (`?q=`) |

### Auth Server (Express) — `http://localhost:5000/api`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Health check |
| `POST` | `/auth/register` | — | Register user |
| `POST` | `/auth/login` | — | Login |
| `GET` | `/auth/me` | JWT | Current user info |
| `GET` | `/products` | JWT | Product list |
| `GET` | `/products/popular` | JWT | Popular products |
| `GET/POST/PATCH/DELETE` | `/cart` | JWT | Cart management |
| `PUT` | `/cart/store` | JWT | Update selected store |

---

## Testing

```bash
cd client
npm run test        # Run all tests with Vitest
npm run lint        # ESLint check
npm run build       # Verify production build
```

---

## Deployment

- **Frontend:** Render / Vercel / Netlify — run `npm run build`, deploy `dist/`
- **Backend (FastAPI):** Render / Railway — `dockerfile` included
- **Auth Server:** Render / Railway — `node index.js`
- **MySQL:** PlanetScale / Railway / Render managed DB
- **MongoDB:** MongoDB Atlas

### Important notes for Render (free tier)

- The backend instance spins down after 15 minutes of inactivity. The first request after a sleep period will take 15–30 seconds (cold start).
- The OCR endpoint calls Gemini synchronously in a background thread (`asyncio.to_thread`) so it does not block the FastAPI event loop while waiting for the AI response.
- Set `GEMINI_MODEL_NAME` to a stable model (not a preview) to avoid hitting low rate limits on the free Gemini tier.
