import { useMemo, useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";
import HomeButton from "../Comps/HomeButton.jsx";
import Button from "../Comps/ui/Button.jsx";

const ChevronIcon = ({ expanded }) => (
  <svg
    className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform duration-200
      ${expanded ? "-rotate-180" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const fmt = (n) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 2 }).format(n);

const StatusBadge = ({ item }) => {
  const base = "inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium";
  if (item.estimated) return <span className={`${base} bg-zinc-100 text-zinc-700 border border-zinc-200`}>הערכה</span>;
  if (item.available) return <span className={`${base} bg-emerald-50 text-emerald-700 border border-emerald-200`}>זמין</span>;
  return <span className={`${base} bg-amber-50 text-amber-800 border border-amber-200`}>לא זמין</span>;
};

const CompareResultsPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const compareData  = state?.compareData;
  const cheapest     = compareData?.cheapest || null;

  usePageTitle(cheapest ? `השוואה — הזול: ${cheapest}` : "השוואת מחירים");

  useEffect(() => {
    if (!compareData) navigate("/cart", { replace: true });
  }, [compareData, navigate]);

  const storesSorted = useMemo(() => {
    const results = compareData?.results || [];
    return [...results].sort((a, b) => (a.total ?? 0) - (b.total ?? 0));
  }, [compareData]);

  const minTotal = storesSorted[0]?.total ?? 0;

  const [openStores, setOpenStores] = useState(() => new Set());

  const toggleStore = useCallback((storeName) => {
    setOpenStores((prev) => {
      const next = new Set(prev);
      if (next.has(storeName)) next.delete(storeName);
      else next.add(storeName);
      return next;
    });
  }, []);

  if (!compareData) return null;

  return (
    <div dir="rtl">

      <header className="bg-white border-b border-zinc-200 px-4 py-3 sticky top-[60px] z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-zinc-900 truncate">השוואת מחירים</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {cheapest ? <>הזול ביותר: <strong className="text-zinc-900 font-semibold">{cheapest}</strong></> : "לא נמצא מידע על הזול ביותר"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="secondary" size="md" onClick={() => navigate("/cart")}>
              חזרה לסל
            </Button>
            <HomeButton />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-3">

        {storesSorted.map((store, rank) => {
          const isCheapest = store.store === cheapest;
          const diff       = store.total - minTotal;
          const itemCount  = Array.isArray(store.items) ? store.items.length : 0;
          const expanded   = openStores.has(store.store);
          const panelId    = `compare-store-panel-${rank}`;

          return (
            <div key={store.store}
              className={`bg-white border rounded-md overflow-hidden
                ${isCheapest ? "border-emerald-500" : "border-zinc-200"}`}>

              <button
                type="button"
                id={`${panelId}-trigger`}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggleStore(store.store)}
                className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-start
                  transition-colors hover:bg-zinc-50/60
                  ${expanded ? "border-b border-zinc-200" : ""}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {isCheapest ? (
                    <span className="text-[11px] font-semibold bg-emerald-700 text-white px-2 py-0.5 rounded-sm flex-shrink-0 uppercase tracking-wider">
                      הזול ביותר
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-zinc-100 text-zinc-600 text-[11px] font-semibold flex-shrink-0">
                      {rank + 1}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{store.store}</p>
                    {itemCount > 0 && (
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {itemCount} מוצרים{!expanded && " · לחץ לפתיחה"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-end">
                    <p className="text-base font-bold text-zinc-900 tabular-nums">
                      {fmt(store.total ?? 0)}
                    </p>
                    {!isCheapest && diff > 0 && (
                      <p className="text-[11px] text-red-700 font-medium mt-0.5 tabular-nums">
                        +{fmt(diff)}
                      </p>
                    )}
                  </div>
                  <ChevronIcon expanded={expanded} />
                </div>
              </button>

              {expanded && Array.isArray(store.items) && store.items.length > 0 && (
                <div id={panelId} role="region" aria-labelledby={`${panelId}-trigger`} className="px-4 py-3 bg-zinc-50/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                          <th className="pb-2 font-semibold">מוצר</th>
                          <th className="pb-2 font-semibold w-16 text-center">כמות</th>
                          <th className="pb-2 font-semibold w-24 text-center">סה״כ</th>
                          <th className="pb-2 font-semibold w-24 text-center">זמינות</th>
                        </tr>
                      </thead>
                      <tbody>
                        {store.items.map((it, idx) => (
                          <tr key={`${it.name}-${idx}`} className="border-t border-zinc-100">
                            <td className="py-1.5 text-sm text-zinc-900">{it.name}</td>
                            <td className="py-1.5 text-sm text-zinc-700 text-center tabular-nums">{parseFloat(it.qty.toFixed(3))}</td>
                            <td className="py-1.5 text-sm font-semibold text-zinc-900 text-center tabular-nums">
                              {fmt(it.total ?? 0)}
                            </td>
                            <td className="py-1.5 text-center">
                              <StatusBadge item={it} />
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
    </div>
  );
};

export default CompareResultsPage;
