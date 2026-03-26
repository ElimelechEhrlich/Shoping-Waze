// components/dashboard/PopularProducts.jsx
// ─────────────────────────────────────────────────────────
// טבלה של המוצרים הפופולריים — נתונים אמיתיים מה-cart ב-DB.
// ─────────────────────────────────────────────────────────

import usePopularProducts from "../../hooks/usePopularProducts.js";

// פורמט מחיר לשקלים
const formatPrice = (n) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 2 }).format(n);

// מדליית מיקום לשלושת הראשונים
const Medal = ({ rank }) => {
  if (rank === 1) return <span title="מקום ראשון">🥇</span>;
  if (rank === 2) return <span title="מקום שני">🥈</span>;
  if (rank === 3) return <span title="מקום שלישי">🥉</span>;
  return <span className="text-sm font-semibold text-slate-400">{rank}</span>;
};

const PopularProducts = () => {
  const { products, loading, error } = usePopularProducts();

  return (
    <section>
      {/* כותרת */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">המוצרים הפופולריים שלך</h2>
          <p className="text-xs text-slate-400 mt-0.5">מבוסס על היסטוריית הקניות שלך</p>
        </div>
      </div>

      {/* טעינה */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 flex justify-center">
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* שגיאה */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-sm text-red-500 text-center">
          לא ניתן לטעון את המוצרים: {error}
        </div>
      )}

      {/* ריק */}
      {!loading && !error && products.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <p className="text-3xl mb-3">🛒</p>
          <p className="text-slate-500 text-sm">עדיין אין היסטוריית קניות</p>
          <p className="text-slate-400 text-xs mt-1">סרוק קבלה ראשונה כדי להתחיל</p>
        </div>
      )}

      {/* טבלה */}
      {!loading && !error && products.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-right">
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs w-12">#</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs">מוצר</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs">סופרמרקט</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs text-center">כמות</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs text-left">סה״כ הוצאה</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr
                  key={`${p.productName}-${p.store}`}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  {/* דירוג */}
                  <td className="px-5 py-3.5 text-center">
                    <Medal rank={i + 1} />
                  </td>

                  {/* שם מוצר */}
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-slate-800">{p.productName}</span>
                  </td>

                  {/* סופרמרקט */}
                  <td className="px-5 py-3.5">
                    <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">
                      {p.store}
                    </span>
                  </td>

                  {/* כמות */}
                  <td className="px-5 py-3.5 text-center font-semibold text-slate-700">
                    {p.totalQuantity}
                  </td>

                  {/* סה"כ הוצאה */}
                  <td className="px-5 py-3.5 text-left font-medium text-slate-700">
                    {formatPrice(p.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default PopularProducts;
