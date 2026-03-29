// components/dashboard/PopularProducts.jsx
import usePopularProducts from "../../hooks/usePopularProducts.js";
import { SkeletonTableRow } from "../Skeleton.jsx";

const formatPrice = (n) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 2 }).format(n);

const Medal = ({ rank }) => {
  if (rank === 1) return <span title="מקום ראשון">🥇</span>;
  if (rank === 2) return <span title="מקום שני">🥈</span>;
  if (rank === 3) return <span title="מקום שלישי">🥉</span>;
  return <span className="text-sm font-semibold text-slate-400">{rank}</span>;
};

/** כרטיס שורה — מובייל בלבד (md+) מוסתר */
const PopularProductMobileCard = ({ p, rank, inCart, cart, onAddAgain }) => {
  const handleAdd = () => {
    if (!onAddAgain) return;
    const existing = cart.find((c) => c.name.toLowerCase() === p.productName.toLowerCase());
    onAddAgain(p.productName, {
      qty: (existing?.qty ?? 0) + 1,
      price: existing?.price ?? 0,
      category: existing?.category ?? "כללי",
    });
  };

  return (
    <article
      className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm"
      dir="rtl"
    >
      <div className="flex gap-3 items-start">
        <div className="shrink-0 w-8 text-center text-lg leading-none pt-0.5" aria-hidden>
          <Medal rank={rank} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="font-semibold text-slate-800 text-[15px] leading-snug break-words">
              {p.productName}
            </h3>
            {inCart > 0 && (
              <span className="shrink-0 text-[11px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                {inCart} בסל
              </span>
            )}
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-600">
            <span className="inline-flex bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium max-w-full break-words">
              {p.store}
            </span>
            <span className="whitespace-nowrap">
              כמות <strong className="text-slate-800">{p.totalQuantity}</strong>
            </span>
            <span className="whitespace-nowrap font-semibold text-slate-800">
              {formatPrice(p.totalPrice)}
            </span>
          </div>
        </div>

        {onAddAgain && (
          <button
            type="button"
            onClick={handleAdd}
            className="shrink-0 w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white
              font-bold text-lg leading-none flex items-center justify-center transition shadow-sm"
            title="הוסף שוב לסל"
          >
            +
          </button>
        )}
      </div>
    </article>
  );
};

const PopularProducts = ({ cart = [], onAddAgain }) => {
  const { products, loading, error } = usePopularProducts();

  const inCartQty = (name) =>
    cart.find((c) => c.name.toLowerCase() === name.toLowerCase())?.qty ?? 0;

  const handleAddDesktop = (p) => {
    if (!onAddAgain) return;
    const existing = cart.find((c) => c.name.toLowerCase() === p.productName.toLowerCase());
    onAddAgain(p.productName, {
      qty: (existing?.qty ?? 0) + 1,
      price: existing?.price ?? 0,
      category: existing?.category ?? "כללי",
    });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">המוצרים הפופולריים שלך</h2>
          <p className="text-xs text-slate-400 mt-0.5">מבוסס על היסטוריית הקניות שלך</p>
        </div>
      </div>

      {/* טעינה — Skeleton */}
      {loading && (
        <>
          <div className="md:hidden space-y-3" aria-hidden>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm animate-pulse"
              >
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-lg bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2.5 min-w-0">
                    <div className="h-4 bg-slate-200 rounded-lg w-[85%]" />
                    <div className="flex gap-2">
                      <div className="h-6 w-20 bg-slate-200 rounded-full" />
                      <div className="h-4 w-16 bg-slate-200 rounded" />
                    </div>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-slate-200 shrink-0" />
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <SkeletonTableRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </>
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

      {/* מובייל: כרטיסים */}
      {!loading && !error && products.length > 0 && (
        <div className="md:hidden space-y-3">
          {products.map((p, i) => (
            <PopularProductMobileCard
              key={`${p.productName}-${p.store}`}
              p={p}
              rank={i + 1}
              inCart={inCartQty(p.productName)}
              cart={cart}
              onAddAgain={onAddAgain}
            />
          ))}
        </div>
      )}

      {/* דסקטופ: טבלה */}
      {!loading && !error && products.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-right">
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs w-12">#</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs min-w-[12rem]">מוצר</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs whitespace-nowrap">
                  סופרמרקט
                </th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs text-center whitespace-nowrap">
                  כמות
                </th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs text-left whitespace-nowrap">
                  סה״כ הוצאה
                </th>
                <th className="px-3 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const inCart = inCartQty(p.productName);
                return (
                  <tr
                    key={`${p.productName}-${p.store}`}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-center align-top">
                      <Medal rank={i + 1} />
                    </td>
                    <td className="px-5 py-3.5 align-top min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-slate-800">{p.productName}</span>
                        {inCart > 0 && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                            {inCart} בסל
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 align-top whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">
                        {p.store}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center font-semibold text-slate-700 align-top whitespace-nowrap">
                      {p.totalQuantity}
                    </td>
                    <td className="px-5 py-3.5 text-left font-medium text-slate-700 align-top whitespace-nowrap">
                      {formatPrice(p.totalPrice)}
                    </td>
                    <td className="px-3 py-3.5 text-center align-top">
                      {onAddAgain && (
                        <button
                          type="button"
                          onClick={() => handleAddDesktop(p)}
                          className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white
                            font-bold text-base flex items-center justify-center transition shadow-sm"
                          title="הוסף שוב לסל"
                        >
                          +
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default PopularProducts;
