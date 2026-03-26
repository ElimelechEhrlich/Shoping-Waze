# Shopping Waze — Smart Grocery Shopping System

A full-stack web application for smart grocery management: scan receipts with AI, manage a personal shopping cart, compare prices across supermarket chains, and collaborate with family on a shared cart.

---

## Key Features

### 🧾 Receipt Scanning
- Upload a photo from your gallery or capture directly from the camera
- **Multi-photo mode** — photograph a long receipt in sections; the browser stitches them into one image using Canvas before sending
- **AI-powered OCR** (Google Gemini) extracts Hebrew product names, quantities and prices automatically
- **Image brightness check** — warns the user before upload if the photo is too dark
- **Detailed error messages** — distinct feedback for empty results, dark images, oversized files, server errors and timeouts
- Edit, add, or remove items before approving the receipt

### 🛒 Cart Management
- Add products from the global catalog or create new products manually (with optional price and store)
- Adjust quantities, remove items, or clear the entire cart
- Sort by default order, name (A–Z), category, or price (high → low)
- Search with debouncing across all cart items
- **Cart templates** — save the current cart under a name (e.g. "Weekly Shop") and reload it in one click (stored in `localStorage`)
- **CSV export** — download the full cart as a spreadsheet-ready CSV file with Hebrew support (BOM)
- Real-time item count and total price in the sticky footer

### 📊 Price Comparison
- Compare the entire cart across all known supermarket chains in the database
- Results sorted cheapest-first; price difference shown for each store
- Data is built from real scanned receipts — grows over time
- Unknown or unrecognized store names are filtered out of comparisons and price history

### 👥 Shared Cart
- Create a shared cart and receive a unique 6-character invite code
- Share the code — other users join in one step
- All members can add, update or remove items simultaneously
- Auto-refresh every 15 seconds; invite code displayed at all times for easy sharing
- Personal cart is completely unaffected

### 🧾 Scan History
- Every approved receipt is automatically saved to the user's history
- Browse past receipts with a full expandable item list and totals
- Delete individual history entries

### 📱 Dashboard
- Quick navigation cards: Scan, Cart (with badge showing item count), Shared Cart, Scan History
- Popular products widget — top items from purchase history with an "add again" button
- First-visit onboarding modal (7 guided slides, shown once per device)

### 🌐 Global Product Catalog
- Every scanned receipt feeds the shared MySQL catalog — available to all users
- Products are always saved; price entries are only stored when the store is recognized
- Average prices per product are calculated from all historical price entries
- Any user can manually add a new product (name, optional price, optional store)

---

## Architecture

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
| **Frontend** | React 19, Vite, Tailwind CSS 4, React Router 7 | UI, state, client-side logic |
| **Auth Server** | Node.js, Express 4, MongoDB, JWT, bcryptjs | Users, cart, shared carts, scan history, popular products |
| **Backend Server** | Python 3.11, FastAPI, SQLAlchemy 2, MySQL 8, Gemini AI | Receipt OCR, global price catalog, cross-store comparison |

---

## Folder Structure

```
Shoping-Waze/
├── client/                             # Frontend (React + Vite)
│   ├── src/
│   │   ├── Pages/
│   │   │   ├── AuthPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── ScanPage.jsx            # Multi-photo, brightness check
│   │   │   ├── ReceiptDetailsPage.jsx  # Editable items, saves to history
│   │   │   ├── CompareResultsPage.jsx  # Price diff per store
│   │   │   ├── SharedCartListPage.jsx  # List + create + join shared carts
│   │   │   ├── SharedCartPage.jsx      # Shared cart with live updates
│   │   │   └── ScanHistoryPage.jsx     # Past receipts
│   │   ├── Comps/
│   │   │   ├── Auth/
│   │   │   ├── Cart/
│   │   │   │   ├── CartCategory.jsx
│   │   │   │   ├── CartFooter.jsx
│   │   │   │   ├── ProductList.jsx
│   │   │   │   ├── AddProductModal.jsx # Manual product creation
│   │   │   │   ├── TemplateModal.jsx   # Save/load cart templates
│   │   │   │   └── NoPriceModal.jsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── NavCard.jsx         # Colored navigation cards with badge
│   │   │   │   └── PopularProducts.jsx
│   │   │   ├── Onboarding/
│   │   │   │   └── OnboardingModal.jsx # 7-slide first-visit guide
│   │   │   ├── Scan/
│   │   │   │   └── CameraCapturePanel.jsx
│   │   │   └── Skeleton.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js              # Auto-sanitize qty from DB
│   │   │   ├── useCompare.js
│   │   │   ├── useProducts.js          # sessionStorage cache
│   │   │   ├── usePopularProducts.js
│   │   │   ├── useSharedCart.js        # Full shared cart CRUD
│   │   │   ├── useTemplates.js         # localStorage templates
│   │   │   ├── useCameraCapture.js     # capturePhotoKeepOpen for multi-photo
│   │   │   ├── useDebounce.js
│   │   │   └── usePageTitle.js
│   │   ├── Contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx        # Global toast notifications
│   │   ├── utils/
│   │   │   └── exportCart.js           # CSV export with Hebrew BOM
│   │   └── Pages/__tests__/
│   ├── .env.example
│   └── vite.config.js
│
├── server_auth/                        # Auth + Cart server (Node.js)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cartController.js           # qty sanitization on every GET
│   │   ├── productsController.js
│   │   ├── sharedCartController.js     # Shared cart with invite codes
│   │   └── historyController.js        # Scan history CRUD
│   ├── models/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── cart.js
│   │   ├── products.js
│   │   ├── sharedCart.js
│   │   └── history.js
│   ├── middleware/auth.js
│   ├── db/client.js
│   └── .env.example
│
└── backend_server/                     # Data + AI server (Python + FastAPI)
    ├── app/
    │   ├── api/
    │   │   ├── receipt_routes.py
    │   │   ├── basket_routes.py
    │   │   └── products_routes.py      # GET list + POST create product
    │   ├── services/
    │   │   ├── ocr_service.py
    │   │   ├── receipt_service.py      # Filters unknown stores
    │   │   └── basket_service.py       # Filters unknown stores from comparison
    │   ├── models/                     # Product, Store, PriceHistory (SQLAlchemy)
    │   ├── schemas/
    │   │   └── products_schema.py      # ProductCreateRequest/Response
    │   └── core/
    ├── migrations/
    ├── tests/
    ├── dockerfile
    ├── docker-compose.yml
    └── .env.example
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas)
- MySQL 8 (local or Docker)
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

**Start MySQL with Docker:**
```bash
cd backend_server
docker-compose up -d
```

**Run the server:**
```bash
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Alembic migrations run **automatically** on startup. To run manually:
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

> **Gemini model note:** Use a stable model such as `gemini-2.0-flash`. Preview models are limited to 2–5 RPM on the free tier, causing OCR failures on repeated scans.

---

## API Reference

### Backend (FastAPI) — `http://localhost:8000`

| Method | Path | Description |
|---|---|---|
| `POST` | `/receipts/upload` | Upload receipt image → OCR → save to MySQL |
| `POST` | `/basket/compare` | Compare cart across all known store chains |
| `GET` | `/products` | List products with average price (`?q=` for search) |
| `POST` | `/products` | Create a new product manually (with optional price + store) |

> Products are always saved. Price history entries are only stored when the store name is recognized (non-empty, non-"Unknown").

---

### Auth Server (Express) — `http://localhost:5000/api`

#### Authentication
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Register new user |
| `POST` | `/auth/login` | — | Login and receive JWT |
| `GET` | `/auth/me` | JWT | Current user info |

#### Personal Cart
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/cart` | JWT | Fetch cart (auto-sanitizes float qty) |
| `POST` | `/cart` | JWT | Add / merge items into cart |
| `PATCH` | `/cart/:name` | JWT | Update item quantity or price |
| `DELETE` | `/cart/:name` | JWT | Remove a single item |
| `DELETE` | `/cart` | JWT | Clear entire cart |

#### Shared Cart
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/shared-carts` | JWT | Create shared cart (returns invite code) |
| `GET` | `/shared-carts` | JWT | All shared carts the user belongs to |
| `POST` | `/shared-carts/join` | JWT | Join via 6-char invite code |
| `GET` | `/shared-carts/:id` | JWT | Get single shared cart |
| `POST` | `/shared-carts/:id/items` | JWT | Add item to shared cart |
| `PATCH` | `/shared-carts/:id/items/:name` | JWT | Update item in shared cart |
| `DELETE` | `/shared-carts/:id/items/:name` | JWT | Remove item from shared cart |
| `DELETE` | `/shared-carts/:id/leave` | JWT | Leave shared cart (non-owner) |
| `DELETE` | `/shared-carts/:id` | JWT | Delete shared cart (owner only) |

#### Scan History
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/history` | JWT | Save approved receipt to history |
| `GET` | `/history` | JWT | Last 50 scan history entries |
| `DELETE` | `/history/:id` | JWT | Delete a history entry |

#### Products
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/products` | JWT | Product list from MongoDB |
| `GET` | `/products/popular` | JWT | Top products from cart history |

---

## Data Flow

```
──── Receipt Scanning ────────────────────────────────────────

User takes 1–8 photos
        │  Browser (Canvas) stitches them into one JPEG
        │  Brightness check warns if image is too dark
        │  POST /receipts/upload
        ▼
FastAPI + Gemini AI
        ├── Extract products, quantities, prices
        ├── Save products to MySQL (always)
        └── Save prices to MySQL (only if store is recognized)
        ▼
ReceiptDetailsPage — user edits items
        │  POST /api/cart  (add to personal cart)
        │  POST /api/history  (save to scan history)
        ▼
MongoDB (user's cart + history)

──── Price Comparison ────────────────────────────────────────

CartPage → POST /basket/compare → FastAPI
        ├── Fetch all known stores from MySQL
        ├── Filter out unknown stores
        └── Calculate basket total per store
        ▼
CompareResultsPage (sorted cheapest first + price diffs)

──── Shared Cart ────────────────────────────────────────────

User A creates shared cart → gets invite code (e.g. "AB12CD")
User B enters code → joins cart
Both users add/update items → MongoDB sharedCarts collection
Frontend polls every 15 seconds for live updates
```

---

## Testing

```bash
# Frontend (Vitest)
cd client
npm run test        # unit tests
npm run lint        # ESLint
npm run build       # production build check

# Backend (pytest)
cd backend_server
pytest tests/ -v    # 23 tests
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
- Services spin down after 15 minutes of inactivity; first request after sleep takes 15–30 s.
- OCR runs in `asyncio.to_thread` and does not block the FastAPI event loop.
- Set `GEMINI_MODEL_NAME` to a stable model to avoid low free-tier rate limits.
- The `sharedCarts` and `scanHistory` collections are created automatically on first use (MongoDB schemaless).
