import { useMemo, useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";

const ChevronIcon = ({ expanded }) => (
  <svg
    className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform duration-200
      ${expanded ? "-rotate-180" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const HomeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CompareResultsPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const compareData  = state?.compareData;
  const cheapest     = compareData?.cheapest || null;

  usePageTitle(cheapest ? `השוואה — הזול: ${cheapest}` : "השוואת מחירים");

  // רענון דף — אין state → חזור לסל
  useEffect(() => {
    if (!compareData) navigate("/cart", { replace: true });
  }, [compareData, navigate]);

  const storesSorted = useMemo(() => {
    const results = compareData?.results || [];
    return [...results].sort((a, b) => (a.total ?? 0) - (b.total ?? 0));
  }, [compareData]);

  const minTotal = storesSorted[0]?.total ?? 0;

  /** מפתחות רשתות פתוחות באקורדיון (ברירת מחדל: סגור — קל לדפדף בין רשתות) */
  const [openStores, setOpenStores] = useState(() => new Set());

  const toggleStore = useCallback((storeName) => {
    setOpenStores((prev) => {
      const next = new Set(prev);
      if (next.has(storeName)) next.delete(storeName);
      else next.add(storeName);
      return next;
    });
  }, []);

  // ממתין להפניה אוטומטית מה-useEffect למעלה
  if (!compareData) return null;

  return (
    <div dir="rtl">

      {/* ── Page sub-header ────────────────────────────────────────────────
          Converted from a plain inline div to a sticky bar that stacks below
          the global AppHeader (top-[60px]). Previously this page had no sticky
          header, so the page title and navigation vanished on scroll. */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-[60px] z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-900 truncate">תוצאות השוואת מחירים</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {cheapest ? `הרשת הזולה ביותר: ${cheapest}` : "לא נמצא מידע על הזול ביותר"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button type="button" onClick={() => navigate("/cart")}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition">
              חזרה לסל
            </button>
            <Link to="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200
                text-slate-600 hover:bg-slate-50 text-sm font-medium transition">
              <HomeIcon />
              בית
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Store cards */}
      <div className="space-y-4">
        {storesSorted.map((store, rank) => {
          const isCheapest = store.store === cheapest;
          const diff       = store.total - minTotal;
          const itemCount  = Array.isArray(store.items) ? store.items.length : 0;
          const expanded   = openStores.has(store.store);
          const panelId    = `compare-store-panel-${rank}`;

          return (
            <div key={store.store}
              className={`bg-white border rounded-2xl shadow-sm overflow-hidden
                ${isCheapest ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200"}`}>

              {/* כותרת רשת — לחיצה פותחת/סוגרת את רשימת המוצרים */}
              <button
                type="button"
                id={`${panelId}-trigger`}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggleStore(store.store)}
                className={`w-full px-5 py-4 flex items-center justify-between gap-3 text-start border-b
                  transition-colors hover:brightness-[0.99] active:bg-slate-50/80
                  ${isCheapest ? "bg-emerald-50 border-emerald-100" : "border-slate-100"}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {isCheapest && (
                    <span className="text-xs font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-full flex-shrink-0">
                      הזול ביותר
                    </span>
                  )}
                  {!isCheapest && (
                    <span className="text-slate-400 text-sm font-medium flex-shrink-0">#{rank + 1}</span>
                  )}
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-slate-900">{store.store}</p>
                    {itemCount > 0 && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {itemCount} מוצרים
                        {!expanded && " · לחץ לפתיחה"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-end">
                    <p className="text-xl font-bold text-emerald-700 tabular-nums">
                      ₪{(store.total ?? 0).toFixed(2)}
                    </p>
                    {!isCheapest && diff > 0 && (
                      <p className="text-xs text-red-500 font-medium mt-0.5">
                        +₪{diff.toFixed(2)} מהזול ביותר
                      </p>
                    )}
                  </div>
                  <ChevronIcon expanded={expanded} />
                </div>
              </button>

              {/* Items table */}
              {expanded && Array.isArray(store.items) && store.items.length > 0 && (
                <div id={panelId} role="region" aria-labelledby={`${panelId}-trigger`} className="px-5 py-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="text-xs text-slate-500 border-b border-slate-100">
                          <th className="pb-2 font-semibold">מוצר</th>
                          <th className="pb-2 font-semibold">כמות</th>
                          <th className="pb-2 font-semibold">סה״כ</th>
                          <th className="pb-2 font-semibold">זמינות</th>
                        </tr>
                      </thead>
                      <tbody>
                        {store.items.map((it, idx) => (
                          <tr key={`${it.name}-${idx}`} className="border-t border-slate-50">
                            <td className="py-2 text-sm text-slate-800">{it.name}</td>
                            <td className="py-2 text-sm text-slate-700">{parseFloat(it.qty.toFixed(3))}</td>
                            <td className="py-2 text-sm font-semibold text-slate-900">
                              ₪{(it.total ?? 0).toFixed(2)}
                            </td>
                            <td className="py-2 text-sm">
                              {it.estimated ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs">הערכה</span>
                              ) : it.available ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs">זמין</span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">לא זמין</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      </div> {/* end max-w-4xl content wrapper */}
    </div>
  );
};

export default CompareResultsPage;
