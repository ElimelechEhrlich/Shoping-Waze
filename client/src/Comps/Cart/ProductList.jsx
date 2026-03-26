// components/cart/ProductList.jsx
// ─────────────────────────────────────────────────────────
// רשימת מוצרים מחולקת לקטגוריות.
// מקבל את products מה-prop (מגיעים מה-DB דרך useProducts).
// ─────────────────────────────────────────────────────────

import { useState, useMemo } from "react";

// שמות קטגוריות בעברית
const CAT_LABELS = {
  vegetables: "ירקות",
  fruits:     "פירות",
  dairy:      "מוצרי חלב",
  bakery:     "מאפים",
  dry:        "יבשים",
  meat:       "בשר ועוף",
  frozen:     "קפואים",
  cleaning:   "ניקיון",
};

const formatPrice = (p) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency", currency: "ILS", maximumFractionDigits: 2,
  }).format(p);

const ProductList = ({ products = [], search, cart, onAdd }) => {
  // ירקות פתוחה כברירת מחדל
  const [openCats, setOpenCats] = useState({ vegetables: true });

  const toggleCat = (cat) =>
    setOpenCats((prev) => ({ ...prev, [cat]: !prev[cat] }));

  // סינון לפי חיפוש
  const filtered = useMemo(() =>
    products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    ), [products, search]);

  // חלוקה לקטגוריות
  const grouped = useMemo(() =>
    filtered.reduce((acc, p) => {
      const cat = p.category || "כללי";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    }, {}), [filtered]);

  const qtyInCart = (name) =>
    cart.find((c) => c.name.toLowerCase() === name.toLowerCase())?.qty ?? 0;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm">
        לא נמצאו מוצרים{search ? ` עבור "${search}"` : ""}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* כותרת קטגוריה */}
          <button
            onClick={() => toggleCat(cat)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold text-slate-700 text-sm">
              {CAT_LABELS[cat] || cat}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{items.length} מוצרים</span>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${openCats[cat] ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* מוצרים */}
          {openCats[cat] && (
            <div className="border-t border-slate-50">
              {items.map((product, idx) => {
                const inCart = qtyInCart(product.name);
                return (
                  <div
                    key={product._id || product.id || product.name}
                    className={`flex items-center gap-3 px-4 py-3
                      ${idx < items.length - 1 ? "border-b border-slate-50" : ""}
                      hover:bg-slate-50 transition-colors`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{product.name}</p>
                      <p className="text-xs mt-0.5">
                        {product.price > 0
                          ? <span className="text-slate-400">{formatPrice(product.price)} / {product.unit}</span>
                          : <span className="text-amber-500">אין מחיר כרגע</span>
                        }
                      </p>
                    </div>

                    {inCart > 0 && (
                      <span className="text-xs bg-emerald-100 text-emerald-700
                        px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                        {inCart} בסל
                      </span>
                    )}

                    <button
                      onClick={() => onAdd(product)}
                      className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600
                        text-white font-bold text-lg flex items-center justify-center
                        transition flex-shrink-0 shadow-sm"
                    >
                      +
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductList;
