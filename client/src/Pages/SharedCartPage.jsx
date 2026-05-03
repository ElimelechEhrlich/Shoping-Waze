// pages/SharedCartPage.jsx
// ─────────────────────────────────────────────────────────
// עמוד הסל השיתופי — הוספה / עדכון / מחיקה.
//
// פאנל הוספת מוצרים: מתקפל (כמו CartPage) — סגור כברירת מחדל,
// נפתח בלחיצה על "הוסף מוצרים לסל". החיפוש נמצא בתוך הפאנל.
// ─────────────────────────────────────────────────────────

import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import useSharedCart     from "../hooks/useSharedCart.js";
import useProducts       from "../hooks/useProducts.js";
import usePageTitle      from "../hooks/usePageTitle.js";
import { SkeletonCard }  from "../Comps/Skeleton.jsx";
import HomeButton        from "../Comps/HomeButton.jsx";
import SharePanel        from "../Comps/SharePanel.jsx";
import Button            from "../Comps/ui/Button.jsx";
import EmptyState        from "../Comps/ui/EmptyState.jsx";

// ── input כמות ───────────────────────────────────────────
const QtyInput = ({ item, cartId, updateItem }) => {
  const [val, setVal] = useState(String(item.qty));

  const commit = () => {
    const n = Math.max(1, parseInt(val, 10) || 1);
    setVal(String(n));
    if (n !== item.qty) updateItem(cartId, item.name, { qty: n });
  };

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <button
        onClick={() => updateItem(cartId, item.name, { qty: Math.max(1, item.qty - 1) })}
        className="w-7 h-7 rounded-sm bg-zinc-200 hover:bg-zinc-300
          flex items-center justify-center text-zinc-700 transition text-lg leading-none"
      >−</button>
      <input
        type="number" min="1" value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        className="w-12 text-center font-semibold text-zinc-800 text-sm
          border border-zinc-300 rounded-sm py-1 focus:outline-none
          focus:ring-2 focus:ring-zinc-400 focus:border-transparent"
      />
      <button
        onClick={() => updateItem(cartId, item.name, { qty: item.qty + 1 })}
        className="w-7 h-7 rounded-sm bg-zinc-200 hover:bg-zinc-300
          flex items-center justify-center text-zinc-800 transition text-lg leading-none"
      >+</button>
    </div>
  );
};

// ── SharedCartPage ────────────────────────────────────────
const SharedCartPage = () => {
  const { id } = useParams();

  const {
    currentCart, loading,
    fetchSharedCart, updateItem, removeItem,
  } = useSharedCart();

  const { products, loading: productsLoading } = useProducts();

  usePageTitle(currentCart ? `סל: ${currentCart.name}` : "סל משותף");

  // ── פאנל הוספת מוצרים (מתקפל) ──────────────────────────
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch]         = useState("");
  const searchRef = useRef(null);

  // ── פאנל שיתוף קוד ──────────────────────────────────────
  const [showInvite, setShowInvite] = useState(false);
  const [copied,     setCopied]     = useState(false);

  // טקסט לשיתוף קוד ההזמנה
  const inviteShareText = currentCart
    ? `הצטרף לסל הקניות "${currentCart.name}" 🛒\nקוד הצטרפות: ${currentCart.inviteCode}`
    : "";

  // סקרול אוטומטי לשדה חיפוש בפתיחת הפאנל
  useEffect(() => {
    if (pickerOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [pickerOpen]);

  // טעינה ראשונית + polling כל 15 שניות (ביטול fetch ביציאה / החלפת סל)
  useEffect(() => {
    const ac = new AbortController();
    fetchSharedCart(id, ac.signal);
    const interval = setInterval(() => fetchSharedCart(id, ac.signal), 15_000);
    return () => {
      ac.abort();
      clearInterval(interval);
    };
  }, [id, fetchSharedCart]);

  // הוספת מוצר (upsert — מונע הכפלה)
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

  const totalItems = currentCart?.items?.reduce((acc, i) => acc + i.qty, 0) ?? 0;
  const totalPrice = currentCart?.items?.reduce(
    (acc, i) => acc + (i.price > 0 ? i.price * i.qty : 0), 0
  ) ?? 0;

  return (
    <div className="min-h-screen bg-zinc-100 font-sans pb-28" dir="rtl">

      {/* ── Page sub-header ──────────────────────────────────
          sticky top-[60px]: stacks below the global AppHeader (≈60 px). */}
      <header className="bg-white border-b border-zinc-200 px-3 sm:px-4 py-3 sticky top-[60px] z-30">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <HomeButton />
            <Button
              to="/shared-carts"
              variant="secondary"
              size="md"
              icon={
                <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              סלים משותפים
            </Button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-semibold text-zinc-900 leading-snug break-words">
                {currentCart?.name ?? "טוען..."}
              </h1>
              {currentCart && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  {currentCart.members.length} חברים · {totalItems} פריטים
                </p>
              )}
            </div>
            {currentCart && (
              <Button
                variant={showInvite ? "primary" : "secondary"}
                size="md"
                onClick={() => setShowInvite((v) => !v)}
                aria-expanded={showInvite}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                }
              >
                {showInvite ? "סגור" : "שתף קוד"}
              </Button>
            )}
          </div>
        </div>

        {showInvite && currentCart && (
          <div className="max-w-3xl mx-auto mt-3">
            <div className="bg-zinc-50 border border-zinc-200 rounded-md p-4 space-y-3">
              <div className="flex items-end justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">קוד הזמנה</p>
                  <span className="font-mono font-bold text-2xl text-zinc-900 tracking-[0.3em] select-all">
                    {currentCart.inviteCode}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCopy}
                  icon={
                    copied ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )
                  }
                >
                  {copied ? "הועתק" : "העתק קוד"}
                </Button>
              </div>

              <div className="border-t border-zinc-200 pt-3">
                <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mb-2">שתף ישירות</p>
                <SharePanel
                  title={`הצטרף לסל "${currentCart.name}"`}
                  text={inviteShareText}
                  url={window.location.origin}
                  color="emerald"
                />
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5 space-y-4">

        {/* ══════════════════════════════════════════════════
            פאנל הוספת מוצרים — מתקפל
        ══════════════════════════════════════════════════ */}
        <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">

          <button
            onClick={() => setPickerOpen((v) => !v)}
            aria-expanded={pickerOpen}
            className={`w-full flex items-center justify-between px-4 py-3 transition-colors
              ${pickerOpen ? "bg-zinc-50 border-b border-zinc-200" : "hover:bg-zinc-50"}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 transition-colors
                ${pickerOpen ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm text-zinc-900">הוסף מוצרים לסל</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {productsLoading ? "טוען..." : `${products.length} מוצרים זמינים`}
                </p>
              </div>
            </div>

            <svg
              className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${pickerOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {pickerOpen && (
            <div className="px-4 pb-4 pt-3 space-y-3">
              <div className="relative">
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="חפש מוצר להוספה..."
                  className="w-full pr-10 pl-9 py-2.5 rounded-sm border border-zinc-300
                    bg-white focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400
                    text-sm placeholder:text-zinc-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="נקה חיפוש"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto rounded-sm space-y-1.5">
                {productsLoading ? (
                  <><SkeletonCard rows={3} /><SkeletonCard rows={2} /></>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-center text-zinc-500 text-sm py-8">לא נמצאו מוצרים</p>
                ) : (
                  filteredProducts.slice(0, 50).map((p) => {
                    const inCart = currentCart?.items?.find(
                      (i) => i.name.toLowerCase() === p.name.toLowerCase()
                    );
                    return (
                      <div key={p.id}
                        className="bg-zinc-50 hover:bg-white rounded-sm border border-zinc-200
                          px-3 py-2 flex items-center gap-3 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-zinc-900 text-sm truncate">{p.name}</p>
                          <p className="text-xs text-zinc-500">{p.category}</p>
                        </div>
                        {inCart && (
                          <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700
                            border border-emerald-200 px-2 py-0.5 rounded-sm flex-shrink-0">
                            {inCart.qty} בסל
                          </span>
                        )}
                        <button
                          onClick={() => handleAdd(p)}
                          className="w-9 h-9 flex items-center justify-center rounded-sm
                            bg-zinc-900 hover:bg-zinc-800 text-white transition flex-shrink-0
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
                          aria-label={`הוסף ${p.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════
            פריטי הסל
        ══════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
              הסל המשותף
              {totalItems > 0 && (
                <span className="mr-2 text-zinc-900 normal-case tracking-normal">· {totalItems} פריטים</span>
              )}
            </h2>

            {currentCart && (
              <div className="flex items-center gap-0.5">
                {currentCart.members.slice(0, 4).map((m, i) => (
                  <div key={i} title={m.displayName}
                    className="w-6 h-6 rounded-sm bg-zinc-700
                      flex items-center justify-center text-[10px] text-white font-bold ring-1 ring-white">
                    {(m.displayName?.[0] ?? "?").toUpperCase()}
                  </div>
                ))}
                {currentCart.members.length > 4 && (
                  <span className="text-xs text-zinc-500 mr-1">+{currentCart.members.length - 4}</span>
                )}
              </div>
            )}
          </div>

          {loading && !currentCart && (
            <><SkeletonCard rows={3} /><SkeletonCard rows={2} /></>
          )}

          {currentCart && (currentCart.items?.length ?? 0) === 0 && (
            <EmptyState
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              title="הסל המשותף ריק"
              description='פתחו למעלה את "הוסף מוצרים לסל" כדי להוסיף פריטים. השאר יראו את העדכון בזמן אמת.'
            />
          )}

          {currentCart && (currentCart.items?.length ?? 0) > 0 && (
            <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
              {currentCart.items.map((item, idx) => (
                <div key={item.name}
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 hover:bg-zinc-50 transition-colors
                    ${idx < currentCart.items.length - 1 ? "border-b border-zinc-100" : ""}`}>

                  <div className="flex-1 min-w-0 ps-0.5">
                    <p className="font-medium text-zinc-900 text-sm line-clamp-2 sm:truncate">{item.name}</p>
                    <p className="text-xs text-zinc-500">
                      {item.category}
                      {item.price > 0 && ` · ₪${item.price.toFixed(2)} ליחידה`}
                    </p>
                  </div>

                  <QtyInput
                    key={`${item.name}-${item.qty}`}
                    item={item}
                    cartId={id}
                    updateItem={updateItem}
                  />

                  <div className="w-14 sm:w-16 text-end flex-shrink-0 tabular-nums">
                    {item.price > 0 ? (
                      <span className="text-sm font-semibold text-zinc-900">
                        ₪{(item.price * item.qty).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(id, item.name)}
                    className="w-9 h-9 sm:w-8 sm:h-8 rounded-sm text-zinc-400
                      hover:bg-red-50 hover:text-red-700 flex items-center justify-center
                      transition flex-shrink-0 touch-manipulation"
                    aria-label={`הסר ${item.name}`}
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
        </div>
      </main>

      {totalItems > 0 && (
        <div className="fixed bottom-0 right-0 left-0 bg-white/95 backdrop-blur border-t border-zinc-200 z-40">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider">פריטים</p>
                <p className="font-bold text-zinc-900 text-base leading-tight">{totalItems}</p>
              </div>
              <div className="w-px h-8 bg-zinc-200" />
              <div>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider">סה״כ</p>
                <p className="font-bold text-zinc-900 text-base leading-tight">
                  {new Intl.NumberFormat("he-IL", {
                    style: "currency", currency: "ILS", maximumFractionDigits: 2,
                  }).format(totalPrice)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <span className="text-[11px]">מתעדכן בזמן אמת</span>
              <div className="w-1.5 h-1.5 rounded-sm bg-emerald-600 animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedCartPage;
