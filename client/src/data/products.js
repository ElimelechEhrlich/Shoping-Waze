// data/products.js
// ─────────────────────────────────────────────────────────
// רשימת מוצרים קבועה (mock).
// כשיהיה API אמיתי — מחליפים את הקובץ הזה בקריאת fetch.
//
// מבנה כל מוצר:
// { id, name, price, category, unit }
//   unit — יחידת מידה לתצוגה (ק"ג, יח', צרור וכו')
//   price — 0 משמעו "אין מחיר ידוע"
// ─────────────────────────────────────────────────────────

export const CATEGORIES = {
  vegetables: "ירקות",
  fruits:     "פירות",
  dairy:      "מוצרי חלב",
  bakery:     "מאפים",
  dry:        "יבשים",
  meat:       "בשר ועוף",
  frozen:     "קפואים",
  cleaning:   "ניקיון",
};

export const PRODUCTS = [
  // ── ירקות ───────────────────────────────────────────────
  { id: 1,  name: "עגבנייה",         category: "vegetables", unit: "ק\"ג" },
  { id: 2,  name: "מלפפון",          category: "vegetables", unit: "ק\"ג" },
  { id: 3,  name: "פלפל אדום",       category: "vegetables", unit: "ק\"ג" },
  { id: 4,  name: "גזר",             category: "vegetables", unit: "ק\"ג" },
  { id: 5,  name: "תפוח אדמה",       category: "vegetables", unit: "ק\"ג" },
  { id: 6,  name: "בצל",             category: "vegetables", unit: "ק\"ג" },
  { id: 7,  name: "שום",               category: "vegetables", unit: "ראש" },
  { id: 8,  name: "חסה",              category: "vegetables", unit: "יח'" },
  { id: 9,  name: "כרוב",            category: "vegetables", unit: "יח'" },
  { id: 10, name: "קישוא",           category: "vegetables", unit: "ק\"ג" },
  { id: 11, name: "חציל",              category: "vegetables", unit: "ק\"ג" },
  { id: 12, name: "עגבניות שרי",     category: "vegetables", unit: "250 גר'" },

  // ── פירות ───────────────────────────────────────────────
  { id: 13, name: "תפוח עץ",         category: "fruits", unit: "ק\"ג" },
  { id: 14, name: "בננה",            category: "fruits", unit: "ק\"ג" },
  { id: 15, name: "תפוז",            category: "fruits", unit: "ק\"ג" },
  { id: 16, name: "מנגו",          category: "fruits", unit: "יח'" },
  { id: 17, name: "אבטיח",           category: "fruits", unit: "ק\"ג" },
  { id: 18, name: "ענבים",          category: "fruits", unit: "ק\"ג" },

  // ── מוצרי חלב ───────────────────────────────────────────
  { id: 19, name: "חלב 3%",          category: "dairy", unit: "ליטר" },
  { id: 20, name: "גבינה צהובה",    category: "dairy", unit: "200 גר'" },
  { id: 21, name: "יוגורט טבעי",     category: "dairy", unit: "יח'" },
  { id: 22, name: "חמאה",           category: "dairy", unit: "250 גר'" },
  { id: 23, name: "שמנת מתוקה",      category: "dairy", unit: "250 מ\"ל" },
  { id: 24, name: "ביצים L",        category: "dairy", unit: "12 יח'" },

  // ── מאפים ───────────────────────────────────────────────
  { id: 25, name: "לחם אחיד",        category: "bakery", unit: "יח'" },
  { id: 26, name: "פיתות",           category: "bakery", unit: "6 יח'" },
  { id: 27, name: "חלה",             category: "bakery", unit: "יח'" },

  // ── יבשים ───────────────────────────────────────────────
  { id: 28, name: "אורז",            category: "dry", unit: "ק\"ג" },
  { id: 29, name: "פסטה",            category: "dry", unit: "500 גר'" },
  { id: 30, name: "שמן זית",        category: "dry", unit: "750 מ\"ל" },
  { id: 31, name: "סוכר",           category: "dry", unit: "ק\"ג" },
  { id: 32, name: "קמח",             category: "dry", unit: "ק\"ג" },
  { id: 33, name: "קפה",               category: "dry", unit: "200 גר'" },
];
