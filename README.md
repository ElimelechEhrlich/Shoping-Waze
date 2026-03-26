# Shopping Waze — מערכת קניות חכמה

אפליקציה לניהול קניות חכם: סרוק קבלה, צבור מאגר מחירים, השווה בין רשתות — והתחסך בכל קנייה.

---

## תכונות מרכזיות

| תכונה | תיאור |
|---|---|
| **סריקת קבלות** | העלאת תמונה או צילום ישיר מהמצלמה |
| **OCR עברי (Gemini AI)** | חילוץ אוטומטי של מוצרים ומחירים מקבלות |
| **מאגר מוצרים ומחירים** | כל קבלה מזינה את מאגר MySQL הכללי — לטובת כלל המשתמשים |
| **ניהול עגלת קניות** | הוספה, עדכון, מחיקה ורוקון הסל |
| **השוואת מחירים** | השוואת הסל בין כל הרשתות הידועות במסד הנתונים |
| **מוצרים פופולריים** | דשבורד עם המוצרים שנרכשו הכי הרבה (לפי היסטוריית הסל) |
| **אימות משתמשים** | הרשמה, התחברות וניהול session עם JWT |

---

## ארכיטקטורה

האפליקציה מורכבת משלושה שירותים עצמאיים:

```
┌──────────────────────────────────────────────────────┐
│                  דפדפן (React)                        │
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

| שכבה | טכנולוגיה | אחריות |
|---|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS 4, React Router 7 | ממשק משתמש, ניהול state |
| **Auth Server** | Node.js, Express 4, MongoDB, JWT, bcryptjs | משתמשים, הרשמה/כניסה, עגלה, מוצרים פופולריים |
| **Backend Server** | Python 3.11, FastAPI, SQLAlchemy 2, MySQL 8, Gemini AI | OCR קבלות, מאגר מחירים, השוואה בין רשתות |

---

## מבנה תיקיות

```
Shoping-Waze/
├── client/                         # Frontend (React + Vite)
│   ├── src/
│   │   ├── Pages/                  # AuthPage, Dashboard, CartPage, ScanPage,
│   │   │                           #   ReceiptDetailsPage, CompareResultsPage
│   │   ├── Comps/                  # Auth, Cart, Dashboard, Scan
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

## הגדרת סביבה מקומית

### דרישות מקדימות

- Node.js 18+
- Python 3.11+
- MongoDB פעיל (מקומי או Atlas)
- MySQL 8 פעיל (מקומי או דרך Docker)
- מפתח API של Google Gemini

---

### 1. Frontend (`client`)

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

כתובת: `http://localhost:5173`

**משתני סביבה:**
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

כתובת: `http://localhost:5000`

**משתני סביבה:**
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

**הרצת MySQL עם Docker (מומלץ):**
```bash
cd backend_server
docker-compose up -d
```

**הרצת שרת Python:**
```bash
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

מיגרציות Alembic רצות **אוטומטית** בעת הפעלה. להרצה ידנית:
```bash
alembic upgrade head
```

כתובת: `http://localhost:8000`  
תיעוד API אינטראקטיבי: `http://localhost:8000/docs`

**משתני סביבה:**
```env
SQLALCHEMY_DATABASE_URL=mysql+pymysql://user:password@localhost:3306/shopping_waze
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL_NAME=gemini-2.0-flash
CORS_ALLOW_ORIGINS=http://localhost:5173
CREATE_TABLES_ON_STARTUP=false
LOG_LEVEL=INFO
```

> **הערה על מודל Gemini:** השתמש במודל יציב כגון `gemini-2.0-flash`. מודלי Preview מוגבלים ל-2–5 בקשות לדקה בחשבון חינמי, מה שגורם לכשלים בסריקות חוזרות.

---

## נקודות API

### Backend (FastAPI) — `http://localhost:8000`

| Method | Path | תיאור |
|---|---|---|
| `POST` | `/receipts/upload` | העלאת תמונת קבלה → OCR → שמירה ל-MySQL |
| `POST` | `/basket/compare` | השוואת עגלה בין כל הרשתות הידועות |
| `GET` | `/products` | רשימת מוצרים עם מחיר ממוצע (חיפוש: `?q=`) |

**הערה:** סריקת קבלה שומרת מוצרים תמיד למאגר הכללי. מחירים נשמרים רק אם שם הרשת מזוהה (לא `Unknown`).

---

### Auth Server (Express) — `http://localhost:5000/api`

| Method | Path | Auth | תיאור |
|---|---|---|---|
| `GET` | `/health` | — | בדיקת זמינות שרת |
| `POST` | `/auth/register` | — | הרשמת משתמש חדש |
| `POST` | `/auth/login` | — | התחברות + קבלת token |
| `GET` | `/auth/me` | JWT | פרטי המשתמש הנוכחי |
| `GET` | `/products` | JWT | רשימת מוצרים (MongoDB) |
| `GET` | `/products/popular` | JWT | מוצרים פופולריים לפי היסטוריית הסל |
| `GET` | `/cart` | JWT | שליפת הסל הנוכחי |
| `POST` | `/cart` | JWT | הוספת פריטים לסל (מיזוג עם קיים) |
| `PATCH` | `/cart/:name` | JWT | עדכון כמות/מחיר של פריט |
| `DELETE` | `/cart/:name` | JWT | מחיקת פריט בודד מהסל |
| `DELETE` | `/cart` | JWT | **רוקון הסל כולו** (לא משפיע על מאגר המוצרים) |
| `PUT` | `/cart/store` | JWT | עדכון הרשת המועדפת |

---

## זרימת נתונים

```
משתמש סורק קבלה
        │
        ▼
  ScanPage (React)
        │ POST /receipts/upload
        ▼
  FastAPI + Gemini AI
        │  ├── חילוץ מוצרים ומחירים
        │  ├── שמירת מוצרים ל-MySQL (תמיד)
        │  └── שמירת מחירים ל-MySQL (רק אם הרשת מזוהה)
        ▼
  ReceiptDetailsPage (React)
        │ POST /api/cart
        ▼
  MongoDB (עגלת המשתמש)

לאחר מכן, השוואת מחירים:
  CartPage → POST /basket/compare → FastAPI
        │  ├── שליפת כל הרשתות הידועות מ-MySQL
        │  ├── סינון רשתות לא ידועות (Unknown)
        │  └── חישוב מחיר הסל בכל רשת
        ▼
  CompareResultsPage (ממוין מהזול ליקר)
```

---

## בדיקות

```bash
# Frontend
cd client
npm run test        # Vitest — כל הבדיקות
npm run lint        # ESLint
npm run build       # בדיקת build לייצור

# Backend
cd backend_server
pytest tests/ -v    # 23 בדיקות pytest
```

---

## פריסה (Deployment)

| רכיב | פלטפורמות מומלצות |
|---|---|
| **Frontend** | Vercel / Netlify / Render — `npm run build` → `dist/` |
| **Backend (FastAPI)** | Render / Railway — `dockerfile` כלול |
| **Auth Server** | Render / Railway — `node index.js` |
| **MySQL** | PlanetScale / Railway / Render Managed DB |
| **MongoDB** | MongoDB Atlas |

### הערות לפריסה על Render (חינמי)

- שירותים חינמיים נכבים לאחר 15 דקות חוסר פעילות — הבקשה הראשונה תיקח 15–30 שניות (cold start).
- ה-OCR רץ ב-`asyncio.to_thread` ולא חוסם את ה-event loop של FastAPI.
- יש להגדיר `GEMINI_MODEL_NAME` למודל יציב (לא preview) כדי להימנע מהגבלות rate limit.
