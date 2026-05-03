// components/cart/ProductList.jsx
// רשימת מוצרים מחולקת לקטגוריות.

import { useState, useMemo } from "react";

const CAT_LABELS = {
  vegetables: "ירקות",
  fruits:     "פירות",
  dairy:      "מוצרי חלב",
  bakery:     "מאפים",
  dry:        "יבשים",
  meat:       "בשר ועוף",
  frozen:     "קפואים",
  cleaning:   "ניקיון",
  snacks:     "חטיפים",
  general:    "כללי",
};

const ProductList = ({ products = [], search, cart, onAdd }) => {
  const [openCats, setOpenCats] = useState({ "ירקות": true });

  const toggleCat = (cat) =>
    setOpenCats((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const filtered = useMemo(() =>
    products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    ), [products, search]);

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
      <div className="text-center py-8 text-zinc-500 text-sm">
        לא נמצאו מוצרים{search ? ` עבור "${search}"` : ""}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="bg-white rounded-md border border-zinc-200 overflow-hidden">

          <button
            onClick={() => toggleCat(cat)}
            aria-expanded={Boolean(openCats[cat])}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 transition-colors"
          >
            <span className="font-semibold text-zinc-900 text-sm">
              {CAT_LABELS[cat] ?? cat}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500">{items.length} מוצרים</span>
              <svg
                className={`w-4 h-4 text-zinc-400 transition-transform ${openCats[cat] ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {openCats[cat] && (
            <div className="border-t border-zinc-200">
              {items.map((product, idx) => {
                const inCart = qtyInCart(product.name);
                return (
                  <div
                    key={product._id || product.id || product.name}
                    className={`flex items-center gap-3 px-4 py-2.5
                      ${idx < items.length - 1 ? "border-b border-zinc-100" : ""}
                      hover:bg-zinc-50 transition-colors`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{product.name}</p>
                      {product.price > 0 && (
                        <p className="text-xs text-zinc-500 mt-0.5">₪{product.price.toFixed(2)}</p>
                      )}
                    </div>

                    {inCart > 0 && (
                      <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700
                        border border-emerald-200 px-2 py-0.5 rounded-sm flex-shrink-0">
                        {inCart} בסל
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onAdd(product)}
                      aria-label={`הוסף ${product.name} לסל`}
                      className="w-9 h-9 rounded-sm bg-zinc-900 hover:bg-zinc-800
                        text-white font-bold text-lg flex items-center justify-center
                        transition flex-shrink-0
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
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
