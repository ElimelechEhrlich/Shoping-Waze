// pages/CartPage.jsx
// ─────────────────────────────────────────────────────────
// עמוד סל הקניות.
// שמאל  — מוצרים מה-DB (דרך useProducts)
// ימין  — הסל הנוכחי
// כפתור "השווה מחירים" — שולח ל-AI agent ועובר לדף תוצאות
// ─────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCart      from "../hooks/useCart.js";
import useProducts  from "../hooks/useProducts.js";
import useCompare   from "../hooks/useCompare.js";
import ProductList  from "../Comps/Cart/ProductList.jsx";
import CartCategory from "../Comps/Cart/CartCategory.jsx";
import CartFooter   from "../Comps/Cart/CartFooter.jsx";
import NoPriceModal from "../Comps/Cart/NoPriceModal.jsx";

const STORES = ["שופרסל", "רמי לוי", "ויקטורי", "מגה"];

const CartPage = () => {
  const navigate = useNavigate();

  const {
    cart, selectedStore, loading: cartLoading, error: _cartError,
    updateItem, removeItem, saveStore,
    totalItems, totalPrice, missingPrice,
  } = useCart();

  const { products, loading: productsLoading } = useProducts();
  const { compare, loading: compareLoading }   = useCompare();

  const [search, setSearch]   = useState("");
  const [pending, setPending] = useState(null);

  // ── הוספת מוצר לסל ────────────────────────────────────
  const handleAddProduct = (product) => {
    if (product.price === 0) { setPending(product); return; }
    const existing = cart.find(
      (c) => c.name.toLowerCase() === product.name.toLowerCase()
    );
    updateItem(product.name, {
      qty:      (existing?.qty ?? 0) + 1,
      price:    product.price,
      category: product.category,
    });
  };

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

  const handleIncrease = (item) => {
    if (item.price === 0) { setPending(item); return; }
    updateItem(item.name, { qty: item.qty + 1 });
  };

  const handleDecrease = (item) => {
    if (item.qty <= 1) return;
    updateItem(item.name, { qty: item.qty - 1 });
  };

  // ── השוואת מחירים → עובר לדף תוצאות ──────────────────
  const handleCompare = async () => {
    const data = await compare(cart, selectedStore);
    if (data) {
      navigate("/compare", { state: { compareData: data } });
    }
  };

  // חלוקת הסל לקטגוריות
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
          <div className="flex items-center gap-3">
            <Link to="/" className="text-slate-400 hover:text-slate-600 transition">
              <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <h1 className="text-lg font-bold text-slate-900 flex-1">סל הקניות</h1>

            {/* כפתור השוואת מחירים */}
            {cart.length > 0 && (
              <button
                onClick={handleCompare}
                disabled={compareLoading}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600
                  disabled:opacity-60 text-white text-sm font-semibold rounded-xl
                  transition shadow-sm"
              >
                {compareLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    משווה...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    השווה מחירים
                  </>
                )}
              </button>
            )}

            {/* dropdown סופרמרקט */}
            <select
              value={selectedStore || ""}
              onChange={(e) => saveStore(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white
                text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="" disabled>בחר סופרמרקט</option>
              {STORES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* חיפוש */}
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
              <button onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* פאנל שמאל — מוצרים */}
          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
              מוצרים להוספה
            </h2>
            {productsLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ProductList
                products={products}
                search={search}
                cart={cart}
                onAdd={handleAddProduct}
              />
            )}
          </section>

          {/* פאנל ימין — הסל */}
          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
              הסל שלי
              {cart.length > 0 && (
                <span className="mr-2 text-emerald-500 normal-case tracking-normal">
                  ({totalItems} פריטים)
                </span>
              )}
            </h2>

            {cartLoading && (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!cartLoading && cart.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
                <p className="text-4xl mb-3">🛒</p>
                <p className="text-slate-400 text-sm">הסל ריק — הוסף מוצרים מהרשימה</p>
              </div>
            )}

            {!cartLoading && Object.entries(groupedCart).map(([cat, items]) => (
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

      {pending && (
        <NoPriceModal
          item={pending}
          onConfirm={handleModalConfirm}
          onCancel={() => setPending(null)}
        />
      )}

      {!cartLoading && cart.length > 0 && (
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
