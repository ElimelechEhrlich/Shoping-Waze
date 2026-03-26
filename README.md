# קבלות חכמות (Shopping Waze)

אפליקציית ווב מלאה לניהול קניות חכם: סריקת קבלות בעברית בעזרת בינה מלאכותית, סל אישי, השוואת מחירים ברשתות סופרמרקט, סלים משותפים עם קוד הזמנה, היסטוריית סריקות, פרופיל משתמש ודירוג אמון מבוסס פעילות.

ממשק המשתמש בעברית (RTL), נבנה ב-React.

---

## תוכן עניינים

1. [ארכיטקטורה](#ארכיטקטורה)
2. [תכונות עיקריות](#תכונות-עיקריות)
3. [מבנה המאגר](#מבנה-המאגר)
4. [ניתוב, כותרות ו-SPA](#ניתוב-כותרות-ו-spa)
5. [דירוג אמון ודיווחים](#דירוג-אמון-ודיווחים)
6. [הרצה מקומית](#הרצה-מקומית)
7. [משתני סביבה](#משתני-סביבה)
8. [API — שרת Auth (Express)](#api--שרת-auth-express)
9. [API — שרת Data (FastAPI)](#api--שרת-data-fastapi)
10. [זרימות נתונים](#זרימות-נתונים)
11. [פריסה לייצור](#פריסה-לייצור)
12. [בדיקות ואיכות קוד](#בדיקות-ואיכות-קוד)

---

## ארכיטקטורה

המערכת מורכבת משלושה רכיבים עיקריים:

| רכיב | טכנולוגיה | תפקיד |
|------|-----------|--------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Router 7 | ממשק משתמש, ניתוב בצד הלקוח, אחסון תבניות סל ב-`localStorage` |
| **server_auth** | Node.js, Express 4, MongoDB, JWT, bcryptjs | משתמשים, סל אישי, סלים משותפים, היסטוריית סריקות, מוצרים פופולריים, דיווחים, דירוג אמון |
| **backend_server** | Python, FastAPI, SQLAlchemy 2, MySQL 8, Google Gemini | OCR לקבלות, קטלוג מוצרים גלובלי, השוואת סל מול מחירים מהמסד |

```
┌─────────────────────────┐
│   דפדפן (React + Vite)   │
│   ברירת מחדל: :5173      │
└───────────┬─────────────┘
            │  VITE_API_URL          VITE_DATA_API_URL
            ▼                        ▼
┌───────────────────┐    ┌──────────────────────┐
│  server_auth      │    │  backend_server       │
│  Express + Mongo  │    │  FastAPI + MySQL      │
│  :5000 /api       │    │  :8000                │
└───────────────────┘    └──────────────────────┘
```

---

## תכונות עיקריות

### סריקת קבלות
- העלאה מהגלריה או צילום במצלמה; תמיכה במספר תמונות (עד 8) ומיזוג לתמונת JPEG אחת ב-Canvas לפני השליחה.
- המרה אחידה ל-JPEG גם לקובץ בודד — מתאים ל-iPhone (JPEG / HEIC אחרי פענוח בדפדפן).
- בדיקת בהירות לפני שליחה; הודעות שגיאה מפורטות (גודל קובץ, פורמט, שרת, timeout).
- OCR בעברית דרך Gemini; עריכת פריטים לפני אישור והוספה לסל.

### סל אישי
- מוצרים מהקטלוג או הוספה ידנית; עדכון כמויות, מיון, חיפוש עם debounce.
- **עריכת שם מוצר** ישירות בסל (ללא מחיקה והוספה מחדש).
- תבניות סל (`localStorage`), ייצוא CSV עם BOM לעברית, פוטר דביק עם סיכום.

### השוואת מחירים
- השוואת תוכן הסל מול רשתות מוכרות במסד הנתונים; סינון חנויות לא מזוהות.

### סלים משותפים
- יצירת סל, קוד הזמנה, הצטרפות; עדכון פריטים; ריענון אוטומטי כל ~15 שניות.
- פאנל **הוספת מוצרים** מתקפל (כמו בסל האישי) — לא תופס חצי מסך קבוע.

### דף הבית (Dashboard)
- ארבעה סעיפים ברורים: סריקת קבלה, הסלים שלי (פרטי + משותפים), היסטוריית קבלות, יצירת סל משותף.
- מוצרים פופולריים מהיסטוריה; אונבורדינג בכניסה ראשונה.
- **שיתוף האפליקציה** לחברים (Web Share API + WhatsApp / מייל / העתקת קישור בדסקטופ).

### ניווט ומובייל
- **AppLayout**: כותרת גלובלית דביקה (`AppHeader`) בכל הדפים המאומתים.
- **תפריט צד (NavDrawer)** — נפתח מכפתור המבורגר; קישורים לכל המסכים העיקריים + התנתקות.
- דף **פרופיל** (`/profile`): שם, צבע אווטר (אותיות ראשונות), אימייל לקריאה בלבד.
- התאמות רספונסיביות (למשל גלילה אופקית לטבלת פריטי קבלה בדף פרטי קבלה).

### דירוג אמון ודיווחים
- ציון 0–100, רמות בעברית וכוכבים — מחושב בשרת לפי אישורי קבלות (שמירה להיסטוריה) ודיווחי משוב.
- `POST /api/reports` — דיווחים נשמרים ב-`userReports`; מגבלה יומית למניעת ספאם.
- ראו פירוט ב-[דירוג אמון ודיווחים](#דירוג-אמון-ודיווחים).

### אימות וניווט
- JWT; שמירת טוקן ב-`localStorage`; `GET /auth/me` לאימות סשן.
- דף 404 ייעודי לנתיבים לא קיימים (בתוך האזור המאומת).

### כותרת דפדפן ו-favicon
- `usePageTitle` לכותרת דינמית לפי דף.
- Favicon מ-`/favicon.svg` ב-`public/`.

---

## מבנה המאגר

```
Shoping-Waze/
├── client/                      # פרונטאנד (Vite + React)
│   ├── public/
│   │   ├── _redirects           # SPA fallback (Netlify / Render static)
│   │   └── favicon.svg
│   ├── src/
│   │   ├── App.jsx              # ניתוב, guards, layout מוגן
│   │   ├── main.jsx             # BrowserRouter, StrictMode
│   │   ├── layouts/AppLayout.jsx
│   │   ├── Comps/
│   │   │   ├── AppHeader.jsx
│   │   │   ├── NavDrawer.jsx    # ניווט צד + אווטר
│   │   │   ├── SharePanel.jsx   # שיתוף (אפליקציה / הזמנה לסל)
│   │   │   ├── Auth/, Cart/, Dashboard/, Onboarding/, Scan/, …
│   │   ├── Pages/
│   │   │   ├── Dashboard.jsx, CartPage.jsx, ScanPage.jsx
│   │   │   ├── ReceiptDetailsPage.jsx, CompareResultsPage.jsx
│   │   │   ├── SharedCartListPage.jsx, SharedCartPage.jsx
│   │   │   ├── ScanHistoryPage.jsx, ProfilePage.jsx
│   │   │   ├── AuthPage.jsx, NotFoundPage.jsx
│   │   ├── Contexts/            # Auth, Toast
│   │   ├── hooks/               # useAuth, useCart, useSharedCart, usePageTitle, …
│   │   └── utils/exportCart.js
│   ├── vercel.json, nginx.conf
│   └── vite.config.js           # base: '/', appType SPA, history fallback בפיתוח
│
├── server_auth/                 # API משתמשים + MongoDB
│   ├── controllers/             # auth, cart, sharedCart, history, products, reports
│   ├── models/User.js
│   ├── routes/
│   ├── middleware/auth.js
│   ├── utils/trustScore.js      # חישוב trust + toPublicUser
│   └── index.js                 # API + הגשת build של React אם קיים client/dist
│
├── backend_server/              # FastAPI + MySQL + Gemini
│   ├── app/api/                 # receipts, basket, products
│   ├── app/services/            # ocr_service, receipt_service, basket_service
│   ├── migrations/              # Alembic
│   ├── tests/
│   ├── docker-compose.yml
│   └── Dockerfile
│
├── render.yaml                  # הגדרות Render: Web (Node) + Static Site (SPA rewrite)
└── README.md
```

---

## ניתוב, כותרות ו-SPA

- **React Router** עם `BrowserRouter` — כל URL אמיתי (`/cart`, `/scan`, …).
- **פיתוח (Vite):** `appType: 'spa'` והגדרות שמבטיחות החזרת `index.html` לנתיבים עמוקים ברענון.
- **ייצור:**
  - שרת Express ב-`server_auth` מגיש קבצים סטטיים מ-`client/dist` ו-`GET *` מחזיר `index.html` ל-SPA.
  - אם הפרונטנד מתארח כ-**Static Site** (למשל Render), נדרש **rewrite** של `/*` ל-`/index.html` (ראו `render.yaml` ו-`client/public/_redirects`).
  - קיימים גם `vercel.json` ו-`nginx.conf` לדוגמה.

---

## דירוג אמון ודיווחים

- בכל מסמך משתמש ב-MongoDB נשמר (או מסונכרן) אובייקט `reputation`:
  - `receiptsConfirmed` — עולה בכל שמירה מוצלחת של קבלה להיסטוריה (`POST /api/history`).
  - `reportsSubmitted` — עולה בכל דיווח מאושר (`POST /api/reports`).
- משתמשים ישנים ללא שדה `reputation`: ב-`GET /api/auth/me` מתבצעת אתחול חד-פעמי של `receiptsConfirmed` לפי מספר רשומות ב-`scanHistory`.
- התשובה ללקוח כוללת אובייקט מחושב `trust`: ציון 0–100, `level`, `levelLabel`, `stars`, ופירוט המונים.
- דיווחים נשמרים בקולקציה `userReports` (סוג, טקסט, הקשר אופציונלי); מגבלת דיווחים ליום למניעת ניצול.

---

## הרצה מקומית

### דרישות מקדימות

- Node.js 18+
- Python 3.11+ (או גרסה תואמת לפרויקט)
- MongoDB (מקומי או Atlas)
- MySQL 8 (מקומי או Docker)
- מפתח **Google Gemini** ל-OCR

### 1. פרונטאנד (`client`)

```bash
cd client
cp .env.example .env
# ערוך .env — כתובות שרת Auth ו-FastAPI
npm install
npm run dev
```

ברירת מחדל: `http://localhost:5173`

### 2. שרת Auth (`server_auth`)

```bash
cd server_auth
cp .env.example .env
# ערוך MONGO_URI, JWT_SECRET, DB_NAME, PORT, CLIENT_URL
npm install
npm run dev
# או: node index.js
```

ברירת מחדל: `http://localhost:5000` — נתיבי API תחת `/api/...`

### 3. שרת Data (`backend_server`)

הרמת MySQL (דוגמה עם Docker):

```bash
cd backend_server
docker compose up -d
```

הרצת FastAPI:

```bash
cp .env.example .env
# ערוך SQLALCHEMY_DATABASE_URL, GEMINI_API_KEY, CORS_ALLOW_ORIGINS
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

תיעוד אינטראקטיבי: `http://localhost:8000/docs`

**המלצה ל-Gemini:** להשתמש במודל יציב (למשל משפחת `gemini-2.0-flash`) כדי להימנע ממגבלות קצב נמוכות במסלול חינמי של מודלי preview.

---

## משתני סביבה

### `client/.env`

| משתנה | תיאור |
|--------|--------|
| `VITE_API_URL` | כתובת בסיס של API ה-Express, למשל `http://localhost:5000/api` |
| `VITE_DATA_API_URL` | כתובת בסיס של FastAPI, למשל `http://localhost:8000` |

### `server_auth/.env`

| משתנה | תיאור |
|--------|--------|
| `MONGO_URI` | מחרוזת חיבור ל-MongoDB |
| `DB_NAME` | שם מסד הנתונים |
| `JWT_SECRET` | סוד לחתימת JWT |
| `JWT_EXPIRES_IN` | תוקף טוקן (ברירת מחדל לדוגמה: `7d`) |
| `PORT` | פורט השרת (ברירת מחדל 5000) |
| `CLIENT_URL` | מקור CORS לדפדפן בפיתוח |

### `backend_server/.env`

| משתנה | תיאור |
|--------|--------|
| `SQLALCHEMY_DATABASE_URL` | חיבור MySQL (פורמט SQLAlchemy + pymysql) |
| `GEMINI_API_KEY` | מפתח API |
| `GEMINI_MODEL_NAME` | שם מודל ל-OCR |
| `CORS_ALLOW_ORIGINS` | רשימת מקורות מופרדים בפסיקים |
| `LOG_LEVEL`, `CREATE_TABLES_ON_STARTUP` | לפי הצורך |

בפריסה, הפרונטנד חייב להצביע על כתובות ה-API האמיתיות של השרתים (משתני `VITE_*` בזמן build).

---

## API — שרת Auth (Express)

בסיס: `http://localhost:5000/api` (או הדומיין בפרודקשן).

### אימות ופרופיל

| שיטה | נתיב | אימות | תיאור |
|------|------|--------|--------|
| POST | `/auth/register` | — | הרשמה |
| POST | `/auth/login` | — | התחברות + JWT |
| GET | `/auth/me` | JWT | משתמש נוכחי + `trust` (אחרי bootstrap reputation אם צריך) |
| PUT | `/auth/me` | JWT | עדכון שם, צבע אווטר |

### דיווחים

| שיטה | נתיב | אימות | תיאור |
|------|------|--------|--------|
| POST | `/reports` | JWT | שליחת דיווח; גוף: `type`, `message`, אופציונלי `context` |

סוגי `type` נתמכים מוגדרים בקוד (למשל: מחיר שגוי, חסר מוצר, תקלה, הצעה, אחר).

### סל אישי

| שיטה | נתיב | תיאור |
|------|------|--------|
| GET/POST/PATCH/DELETE | `/cart`, `/cart/:name` | ניהול סל |

### סלים משותפים

| שיטה | נתיב | תיאור |
|------|------|--------|
| POST | `/shared-carts` | יצירה |
| GET | `/shared-carts` | רשימת הסלים שלי |
| POST | `/shared-carts/join` | הצטרפות בקוד |
| GET/PATCH/DELETE | `/shared-carts/:id`, `.../items/...` | קריאה ועדכון פריטים |
| DELETE | `/shared-carts/:id/leave` | יציאה (לא בעלים) |
| DELETE | `/shared-carts/:id` | מחיקה (בעלים) |

### היסטוריית סריקות

| שיטה | נתיב | תיאור |
|------|------|--------|
| POST | `/history` | שמירת קבלה מאושרת (+עדכון `receiptsConfirmed`) |
| GET | `/history` | עד 50 רשומות אחרונות |
| DELETE | `/history/:id` | מחיקת רשומה |

### מוצרים (Mongo)

| שיטה | נתיב | תיאור |
|------|------|--------|
| GET | `/products` | רשימה / חיפוש |
| GET | `/products/popular` | פופולריים לפי היסטוריה |

---

## API — שרת Data (FastAPI)

בסיס: `http://localhost:8000`

| שיטה | נתיב | תיאור |
|------|------|--------|
| POST | `/receipts/upload` | העלאת תמונת קבלה → OCR → שמירה ב-MySQL לפי הלוגיקה בשרת |
| POST | `/basket/compare` | השוואת סל מחירים |
| GET | `/products` | רשימת מוצרים (כולל חיפוש `?q=`) |
| POST | `/products` | יצירת מוצר ידנית |

מוצרים נשמרים תמיד; רשומות מחיר תלויות בזיהוי חנות תקין.

---

## זרימות נתונים

**סריקה:** תמונה(ות) → `POST /receipts/upload` (FastAPI + Gemini) → עריכה ב-`ReceiptDetailsPage` → `POST /api/cart` + `POST /api/history` (Express) → עדכון סל והיסטוריה ב-MongoDB; ריענון משתמש לעדכון דירוג אמון.

**השוואה:** סל מה-API של Express נשלח ל-`POST /basket/compare` → תוצאות ממוינות לפי זול ביותר.

**סל משותף:** נתונים ב-MongoDB; הלקוח מרענן תקופתית את מצב הסל.

---

## פריסה לייצור

- **Render (דוגמה ב-`render.yaml`):**
  - **Web service** — בונה את `client`, מתקין `server_auth`, מריץ `node server_auth/index.js`; מגיש גם API וגם את ה-SPA מתוך `client/dist` עם catch-all ל-`index.html`.
  - **Static site** — בניית `client` בלבד; **חובה** הגדרת rewrite של `/*` ל-`/index.html` (מופיע בקובץ) כדי שרענון בנתיבים כמו `/cart` לא יחזיר 404.
- **Vercel / Netlify:** השתמשו ב-`vercel.json` / `_redirects` כפי שב-`client`.
- **MongoDB Atlas**, **MySQL מנוהל**, וסודות (`JWT_SECRET`, `GEMINI_API_KEY`) בפריסה — לא בקוד.

במסלול חינמי שירותים עלולים "להירדם" — לקריאה הראשונה אחרי חוסר פעילות ייתכן עיכוב.

---

## בדיקות ואיכות קוד

```bash
# פרונטאנד
cd client
npm run test      # Vitest
npm run lint      # ESLint
npm run build     # בדיקת build ייצור

# Python
cd backend_server
pytest tests/ -v
```

---

## סיכום

הפרויקט משלב חוויית קניות בעברית עם שני שרתי backend (Mongo לאפליקציה ומשתמשים, MySQL לקטלוג ומחירים), OCR מבוסס Gemini, ותכונות קהילתיות (סל משותף, שיתוף, דירוג אמון, דיווחים). להרצה מלאה יש להפעיל את שלושת הרכיבים ולוודא שמשתני `VITE_*` תואמים לכתובות השרתים בפועל.
