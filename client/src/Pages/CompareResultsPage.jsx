import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CompareResultsPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const compareData = state?.compareData;
  const cheapest = compareData?.cheapest || null;

  const storesSorted = useMemo(() => {
    const results = compareData?.results || [];
    // If backend sends already sorted, this is a no-op.
    return [...results].sort((a, b) => (a.total ?? 0) - (b.total ?? 0));
  }, [compareData]);

  if (!compareData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10" dir="rtl">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h1 className="text-xl font-bold text-slate-900">אין תוצאות להצגה</h1>
          <p className="text-sm text-slate-500">חזור לסל ובצע השוואה מחדש.</p>
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
          >
            חזרה לסל
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">תוצאות השוואת מחירים</h1>
          <p className="text-sm text-slate-500 mt-1">
            {cheapest ? `הרשת הזולה ביותר: ${cheapest}` : "לא נמצא מידע על הזול ביותר"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold"
        >
          חזרה לסל
        </button>
      </div>

      <div className="space-y-4">
        {storesSorted.map((store) => (
          <div key={store.store} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <p className="text-sm text-slate-500">רשת</p>
                <p className="text-lg font-bold text-slate-900">{store.store}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">סה״כ</p>
                <p className="text-xl font-bold text-emerald-700">₪{(store.total ?? 0).toFixed(2)}</p>
              </div>
            </div>

            {Array.isArray(store.items) && store.items.length > 0 && (
              <div className="px-5 py-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="text-sm text-slate-600">
                        <th className="pb-2">מוצר</th>
                        <th className="pb-2">כמות</th>
                        <th className="pb-2">סה״כ</th>
                        <th className="pb-2">זמינות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.items.map((it, idx) => (
                        <tr key={`${it.name}-${idx}`} className="border-t border-slate-100">
                          <td className="py-2 text-sm text-slate-800">{it.name}</td>
                          <td className="py-2 text-sm text-slate-700">
                            {parseFloat(it.qty.toFixed(3))}
                          </td>
                          <td className="py-2 text-sm font-semibold text-slate-900">
                            ₪{(it.total ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-sm">
                            {it.estimated ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                                הערכה
                              </span>
                            ) : it.available ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                זמין
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                לא זמין
                              </span>
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
        ))}
      </div>
    </div>
  );
};

export default CompareResultsPage;

