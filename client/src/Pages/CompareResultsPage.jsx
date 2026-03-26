import { useMemo, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";

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

  // ממתין להפניה אוטומטית מה-useEffect למעלה
  if (!compareData) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">תוצאות השוואת מחירים</h1>
          <p className="text-sm text-slate-500 mt-1">
            {cheapest ? `הרשת הזולה ביותר: ${cheapest}` : "לא נמצא מידע על הזול ביותר"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate("/cart")}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold">
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

      {/* Store cards */}
      <div className="space-y-4">
        {storesSorted.map((store, rank) => {
          const isCheapest = store.store === cheapest;
          const diff       = store.total - minTotal;

          return (
            <div key={store.store}
              className={`bg-white border rounded-2xl shadow-sm overflow-hidden
                ${isCheapest ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200"}`}>

              {/* Store header */}
              <div className={`px-5 py-4 flex items-center justify-between border-b
                ${isCheapest ? "bg-emerald-50 border-emerald-100" : "border-slate-100"}`}>
                <div className="flex items-center gap-3">
                  {isCheapest && (
                    <span className="text-xs font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-full">
                      הזול ביותר
                    </span>
                  )}
                  {!isCheapest && (
                    <span className="text-slate-400 text-sm font-medium">#{rank + 1}</span>
                  )}
                  <div>
                    <p className="text-lg font-bold text-slate-900">{store.store}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-emerald-700">₪{(store.total ?? 0).toFixed(2)}</p>
                  {!isCheapest && diff > 0 && (
                    <p className="text-xs text-red-500 font-medium mt-0.5">
                      +₪{diff.toFixed(2)} מהזול ביותר
                    </p>
                  )}
                </div>
              </div>

              {/* Items table */}
              {Array.isArray(store.items) && store.items.length > 0 && (
                <div className="px-5 py-4">
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
    </div>
  );
};

export default CompareResultsPage;
