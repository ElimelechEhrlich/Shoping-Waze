// pages/SharedCartPage.jsx
// ─────────────────────────────────────────────────────────
// עמוד הסל השיתופי — הוספה / עדכון / מחיקה
// ─────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import useSharedCart from "../hooks/useSharedCart.js";
import useProducts   from "../hooks/useProducts.js";
import usePageTitle  from "../hooks/usePageTitle.js";
import { useAuth }   from "../hooks/useAuth.js";
import { SkeletonCard } from "../Comps/Skeleton.jsx";
import HomeButton from "../Comps/HomeButton.jsx";

// ── input כמות עם סנכרון עם שרת ──────────────────────────
const QtyInput = ({ item, cartId, updateItem, removeItem }) => {
  const [val, setVal] = useState(String(item.qty));
  useEffect(() => { setVal(String(item.qty)); }, [item.qty]);

  const commit = () => {
    const n = Math.max(1, parseInt(val, 10) || 1);
    setVal(String(n));
    if (n !== item.qty) updateItem(cartId, item.name, { qty: n });
  };

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <button
        onClick={() => updateItem(cartId, item.name, { qty: item.qty - 1 })}
        className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100
          flex items-center justify-center text-slate-600 transition text-lg leading-none"
      >−</button>
      <input
        type="number"
        min="1"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        className="w-12 text-center font-semibold text-slate-700 text-sm
          border border-slate-200 rounded-lg py-1 focus:outline-none
          focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
      />
      <button
        onClick={() => updateItem(cartId, item.name, { qty: item.qty + 1 })}
        className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100
          flex items-center justify-center text-slate-600 transition text-lg leading-none"
      >+</button>
    </div>
  );
};

const SharedCartPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    currentCart, loading,
    fetchSharedCart, addItem, updateItem, removeItem,
    leaveCart, deleteCart,
  } = useSharedCart();

  const { products, loading: productsLoading } = useProducts();

  const [search, setSearch]         = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied]         = useState(false);

  usePageTitle(currentCart ? `סל: ${currentCart.name}` : "סל משותף");

  useEffect(() => {
    fetchSharedCart(id);
    const interval = setInterval(() => fetchSharedCart(id), 15_000);
    return () => clearInterval(interval);
  }, [id, fetchSharedCart]);

  const isOwner = currentCart
    ? currentCart.ownerId?.toString() === user?._id?.toString()
    : false;

  // שימוש ב-PATCH (upsert) במקום POST כדי למנוע הכפלת כמות
  const handleAdd = (product) => {
    const existing = currentCart?.items?.find(
      (i) => i.name.toLowerCase() === product.name.toLowerCase()
    );
    updateItem(id, product.name, {
      qty:      (existing?.qty ?? 0) + 1,
      price:    product.price ?? 0,
      category: product.category ?? "כללי",
    });
  };

  const handleCopy = () => {
    if (!currentCart?.inviteCode) return;
    navigator.clipboard.writeText(currentCart.inviteCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const filteredProducts = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems  = currentCart?.items?.reduce((acc, i) => acc + i.qty, 0) ?? 0;
  const totalPrice  = currentCart?.items?.reduce((acc, i) => acc + (i.price > 0 ? i.price * i.qty : 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-24" dir="rtl">

      {/* ── Header ─────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto space-y-2">
          <div className="flex items-center gap-3">
            <HomeButton />
            <Link to="/shared-carts"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200
                text-slate-600 hover:bg-slate-50 text-sm font-medium transition flex-shrink-0">
              <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              סלים משותפים
            </Link>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-slate-900 truncate">
                {currentCart?.name ?? "טוען..."}
              </h1>
              {currentCart && (
                <p className="text-xs text-slate-400">
                  {currentCart.members.length} חברים · {totalItems} פריטים
                </p>
              )}
            </div>

            {currentCart && (
              <button
                onClick={() => setShowInvite((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-600
                  border border-blue-200 hover:bg-blue-50 rounded-xl transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                שתף קוד
              </button>
            )}
          </div>

          {/* ── פאנל שיתוף קוד ──────────────────────── */}
          {showInvite && currentCart && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-blue-500 mb-1">שלח את הקוד הזה לחבר שרוצה להצטרף:</p>
                <span className="font-mono font-bold text-2xl text-blue-700 tracking-[0.3em]">
                  {currentCart.inviteCode}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600
                  text-white text-xs font-semibold rounded-xl transition"
              >
                {copied ? (
                  <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>הועתק!</>
                ) : (
                  <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>העתק</>
                )}
              </button>
            </div>
          )}

          {/* ── חיפוש מוצרים ────────────────────────── */}
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
              placeholder="חפש מוצר להוספה..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200
                bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">✕</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── פאנל מוצרים להוספה ─────────────────── */}
          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
              מוצרים להוספה לסל
            </h2>
            {productsLoading ? (
              <><SkeletonCard rows={4} /><SkeletonCard rows={3} /></>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {filteredProducts.slice(0, 40).map((p) => {
                  const inCart = currentCart?.items?.find(
                    (i) => i.name.toLowerCase() === p.name.toLowerCase()
                  );
                  return (
                    <div key={p.id}
                      className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.category}</p>
                      </div>
                      {inCart && (
                        <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          {inCart.qty} בסל
                        </span>
                      )}
                      <button
                        onClick={() => handleAdd(p)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500
                          hover:bg-emerald-600 text-white transition flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-8">לא נמצאו מוצרים</p>
                )}
              </div>
            )}
          </section>

          {/* ── פאנל הסל השיתופי ───────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                הסל המשותף
                {(currentCart?.items?.length ?? 0) > 0 && (
                  <span className="mr-2 text-emerald-500 normal-case tracking-normal">
                    ({totalItems} פריטים)
                  </span>
                )}
              </h2>

              {/* חברי הסל */}
              {currentCart && (
                <div className="flex items-center gap-1">
                  {currentCart.members.slice(0, 3).map((m, i) => (
                    <div key={i}
                      title={m.displayName}
                      className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                        flex items-center justify-center text-[9px] text-white font-bold ring-1 ring-white"
                    >
                      {(m.displayName?.[0] ?? "?").toUpperCase()}
                    </div>
                  ))}
                  {currentCart.members.length > 3 && (
                    <span className="text-xs text-slate-400">+{currentCart.members.length - 3}</span>
                  )}
                </div>
              )}
            </div>

            {loading && !currentCart && (
              <><SkeletonCard rows={3} /><SkeletonCard rows={2} /></>
            )}

            {currentCart && (currentCart.items?.length ?? 0) === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
                <p className="text-4xl mb-3">🛒</p>
                <p className="text-slate-400 text-sm">הסל ריק — הוסף מוצרים מהרשימה</p>
              </div>
            )}

            {currentCart && currentCart.items?.length > 0 && (
              <div className="space-y-2">
                {currentCart.items.map((item) => (
                  <div key={item.name}
                    className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3
                      flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        {item.category}
                        {item.price > 0 && ` · ₪${item.price.toFixed(2)}`}
                      </p>
                    </div>

                    {/* כמות */}
                    <QtyInput
                      item={item}
                      cartId={id}
                      updateItem={updateItem}
                      removeItem={removeItem}
                    />

                    <button
                      onClick={() => removeItem(id, item.name)}
                      className="w-7 h-7 rounded-lg text-red-400 hover:text-red-600
                        hover:bg-red-50 flex items-center justify-center transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ── Footer סיכום ───────────────────────────── */}
      {(currentCart?.items?.length ?? 0) > 0 && (
        <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-slate-200 shadow-lg z-40" dir="rtl">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="text-center">
                <p className="text-xs text-slate-400">פריטים</p>
                <p className="font-bold text-slate-800 text-lg leading-none">{totalItems}</p>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="text-center">
                <p className="text-xs text-slate-400">סה"כ</p>
                <p className="font-bold text-emerald-600 text-lg leading-none">
                  {new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 2 }).format(totalPrice)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                מתעדכן כל 15 שניות
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedCartPage;
