// pages/CartPage.jsx
// ─────────────────────────────────────────────────────────
// עמוד סל הקניות — layout שני עמודות:
//   שמאל  — רשימת מוצרים לבחירה (ProductList)
//   ימין  — סל הקניות הנוכחי (CartCategory)
//
// ברצועה עליונה: dropdown סופרמרקט + חיפוש משותף.
// footer קבוע: סיכום סל.
// ─────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import useCart from "../hooks/useCart.js";
import ProductList   from "../Comps/Cart/ProductList.jsx";
import CartCategory  from "../Comps/Cart/CartCategory.jsx";
import CartFooter    from "../Comps/Cart/CartFooter.jsx";
import NoPriceModal  from "../Comps/Cart/NoPriceModal.jsx";

const CartPage = () => {
  const {
    cart, selectedStore, loading, error,
    updateItem, removeItem, saveStore,
    totalItems, totalPrice, missingPrice,
  } = useCart();

  const [search, setSearch]   = useState("");
  // pendingProduct — מוצר ללא מחיר שממתין לאישור
  const [pending, setPending] = useState(null);

  // ── הוספת מוצר מהרשימה לסל ────────────────────────────
  const handleAddProduct = (product) => {
    // אם אין מחיר — פותחים modal אישור
    if (product.price === 0) {
      setPending(product);
      return;
    }
    const existing = cart.find(
      (c) => c.name.toLowerCase() === product.name.toLowerCase()
    );
    updateItem(product.name, {
      qty:      (existing?.qty ?? 0) + 1,
      price:    product.price,
      category: product.category,
    });
  };

  // ── אישור modal (עם מחיר או בלי) ──────────────────────
  const handleModalConfirm = (price) => {
    const existing = cart.find(
      (c) => c.name.toLowerCase() === pending.name.toLowerCase()
    );
    updateItem(pending.name, {
      qty:      (existing?.qty ?? 0) + 1,
      price:    price > 0 ? price : 0,
      category: pending.category,
    });
    setPending(null);
  };

  // ── +/- כמות בסל ───────────────────────────────────────
  const handleIncrease = (item) => {
    if (item.price === 0) { setPending(item); return; }
    updateItem(item.name, { qty: item.qty + 1 });
  };

  const handleDecrease = (item) => {
    if (item.qty <= 1) return;
    updateItem(item.name, { qty: item.qty - 1 });
  };

  // ── חלוקת הסל לפי קטגוריה ─────────────────────────────
  const groupedCart = useMemo(() =>
    cart.reduce((acc, item) => {
      const cat = item.category || "כללי";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {}), [cart]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-24" dir="rtl">

      {/* ── Header ─────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto space-y-3">

          {/* שורה עליונה */}
          <div className="flex items-center gap-3">
            {/* חזרה ל-Dashboard */}
            <Link to="/" className="text-slate-400 hover:text-slate-600 transition">
              <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <h1 className="text-lg font-bold text-slate-900 flex-1">סל הקניות</h1>

          </div>

          {/* חיפוש — משותף לשתי העמודות */}
          <div className="relative">
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חפש מוצר..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200
                bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >✕</button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main — שני פאנלים ──────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── פאנל שמאל: רשימת מוצרים ─────────────────── */}
          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">
              מוצרים להוספה
            </h2>
            <ProductList
              search={search}
              cart={cart}
              onAdd={handleAddProduct}
            />
          </section>

          {/* ── פאנל ימין: הסל הנוכחי ────────────────────── */}
          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">
              הסל שלי
              {cart.length > 0 && (
                <span className="mr-2 text-emerald-500 normal-case tracking-normal">
                  ({totalItems} פריטים)
                </span>
              )}
            </h2>

            {loading && (
              <div className="flex justify-center py-16">
                <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-sm text-red-500 text-center">
                שגיאה בטעינת הסל: {error}
              </div>
            )}

            {!loading && !error && cart.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm
                p-10 text-center text-slate-400">
                <p className="text-4xl mb-3">🛒</p>
                <p className="text-sm">הסל ריק — הוסף מוצרים מהרשימה משמאל</p>
              </div>
            )}

            {!loading && !error && Object.entries(groupedCart).map(([cat, items]) => (
              <CartCategory
                key={cat}
                category={cat}
                items={items}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={removeItem}
              />
            ))}
          </section>
        </div>
      </main>

      {/* ── Modal אישור מוצר ללא מחיר ─────────────────── */}
      {pending && (
        <NoPriceModal
          item={pending}
          onConfirm={handleModalConfirm}
          onCancel={() => setPending(null)}
        />
      )}

      {/* ── Footer קבוע ────────────────────────────────── */}
      {!loading && cart.length > 0 && (
        <CartFooter
          totalItems={totalItems}
          totalPrice={totalPrice}
          missingPrice={missingPrice}
          selectedStore={selectedStore}
        />
      )}
    </div>
  );
};

export default CartPage;
