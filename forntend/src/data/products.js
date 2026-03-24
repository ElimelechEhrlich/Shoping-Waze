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
  { id: 1,  name: "עגבנייה",       price: 4.9,  category: "vegetables", unit: "ק\"ג" },
  { id: 2,  name: "מלפפון",        price: 3.9,  category: "vegetables", unit: "ק\"ג" },
  { id: 3,  name: "פלפל אדום",     price: 8.9,  category: "vegetables", unit: "ק\"ג" },
  { id: 4,  name: "גזר",           price: 2.9,  category: "vegetables", unit: "ק\"ג" },
  { id: 5,  name: "תפוח אדמה",     price: 3.5,  category: "vegetables", unit: "ק\"ג" },
  { id: 6,  name: "בצל",           price: 2.5,  category: "vegetables", unit: "ק\"ג" },
  { id: 7,  name: "שום",           price: 0,    category: "vegetables", unit: "ראש" },
  { id: 8,  name: "חסה",           price: 4.5,  category: "vegetables", unit: "יח'" },
  { id: 9,  name: "כרוב",          price: 5.9,  category: "vegetables", unit: "יח'" },
  { id: 10, name: "קישוא",         price: 5.5,  category: "vegetables", unit: "ק\"ג" },
  { id: 11, name: "חציל",          price: 6.9,  category: "vegetables", unit: "ק\"ג" },
  { id: 12, name: "עגבניות שרי",   price: 9.9,  category: "vegetables", unit: "250 גר'" },

  // ── פירות ───────────────────────────────────────────────
  { id: 13, name: "תפוח עץ",       price: 6.9,  category: "fruits", unit: "ק\"ג" },
  { id: 14, name: "בננה",          price: 5.9,  category: "fruits", unit: "ק\"ג" },
  { id: 15, name: "תפוז",          price: 4.9,  category: "fruits", unit: "ק\"ג" },
  { id: 16, name: "מנגו",          price: 0,    category: "fruits", unit: "יח'" },
  { id: 17, name: "אבטיח",         price: 3.9,  category: "fruits", unit: "ק\"ג" },
  { id: 18, name: "ענבים",         price: 12.9, category: "fruits", unit: "ק\"ג" },

  // ── מוצרי חלב ───────────────────────────────────────────
  { id: 19, name: "חלב 3%",        price: 6.9,  category: "dairy", unit: "ליטר" },
  { id: 20, name: "גבינה צהובה",   price: 14.9, category: "dairy", unit: "200 גר'" },
  { id: 21, name: "יוגורט טבעי",   price: 5.9,  category: "dairy", unit: "יח'" },
  { id: 22, name: "חמאה",          price: 12.9, category: "dairy", unit: "250 גר'" },
  { id: 23, name: "שמנת מתוקה",    price: 8.9,  category: "dairy", unit: "250 מ\"ל" },
  { id: 24, name: "ביצים L",       price: 13.9, category: "dairy", unit: "12 יח'" },

  // ── מאפים ───────────────────────────────────────────────
  { id: 25, name: "לחם אחיד",      price: 7.9,  category: "bakery", unit: "יח'" },
  { id: 26, name: "פיתות",         price: 6.9,  category: "bakery", unit: "6 יח'" },
  { id: 27, name: "חלה",           price: 9.9,  category: "bakery", unit: "יח'" },

  // ── יבשים ───────────────────────────────────────────────
  { id: 28, name: "אורז",          price: 8.9,  category: "dry", unit: "ק\"ג" },
  { id: 29, name: "פסטה",          price: 5.9,  category: "dry", unit: "500 גר'" },
  { id: 30, name: "שמן זית",       price: 24.9, category: "dry", unit: "750 מ\"ל" },
  { id: 31, name: "סוכר",          price: 5.5,  category: "dry", unit: "ק\"ג" },
  { id: 32, name: "קמח",           price: 6.9,  category: "dry", unit: "ק\"ג" },
  { id: 33, name: "קפה",           price: 0,    category: "dry", unit: "200 גר'" },
];
