// components/dashboard/PopularProducts.jsx
import usePopularProducts from "../../hooks/usePopularProducts.js";
import { SkeletonTableRow } from "../Skeleton.jsx";
import EmptyState from "../ui/EmptyState.jsx";

const formatPrice = (n) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 2 }).format(n);

const RankNumber = ({ rank }) => (
  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-sm text-[11px] font-semibold
    ${rank <= 3 ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"}`}>
    {rank}
  </span>
);

const InCartBadge = ({ qty }) => (
  <span className="shrink-0 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200
    px-2 py-0.5 rounded-sm whitespace-nowrap">
    {qty} בסל
  </span>
);

const StoreChip = ({ name }) => (
  <span className="inline-flex items-center bg-zinc-100 text-zinc-700 text-xs px-2 py-0.5 rounded-sm
    max-w-full truncate">
    {name}
  </span>
);

const AddButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="הוסף שוב לסל"
    className="shrink-0 w-9 h-9 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-white
      font-bold text-lg leading-none flex items-center justify-center transition
      focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
  >
    +
  </button>
);

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
      className="rounded-md border border-zinc-200 bg-white p-3"
      dir="rtl"
    >
      <div className="flex gap-3 items-start">
        <div className="shrink-0 pt-0.5">
          <RankNumber rank={rank} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="font-semibold text-zinc-900 text-[14px] leading-snug break-words">
              {p.productName}
            </h3>
            {inCart > 0 && <InCartBadge qty={inCart} />}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-zinc-600">
            <StoreChip name={p.store} />
            <span className="whitespace-nowrap">
              כמות <strong className="text-zinc-900">{p.totalQuantity}</strong>
            </span>
            <span className="whitespace-nowrap font-semibold text-zinc-900">
              {formatPrice(p.totalPrice)}
            </span>
          </div>
        </div>

        {onAddAgain && <AddButton onClick={handleAdd} />}
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
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
          מוצרים פופולריים
        </span>
        <div className="flex-1 h-px bg-zinc-200" />
      </div>

      {/* טעינה — Skeleton */}
      {loading && (
        <>
          <div className="md:hidden space-y-2.5" aria-hidden>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="rounded-md border border-zinc-200 bg-white p-3 animate-pulse"
              >
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-sm bg-zinc-200 shrink-0" />
                  <div className="flex-1 space-y-2.5 min-w-0">
                    <div className="h-3.5 bg-zinc-200 rounded-sm w-[85%]" />
                    <div className="flex gap-2">
                      <div className="h-5 w-20 bg-zinc-200 rounded-sm" />
                      <div className="h-3 w-16 bg-zinc-200 rounded-sm" />
                    </div>
                  </div>
                  <div className="h-9 w-9 rounded-sm bg-zinc-200 shrink-0" />
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block bg-white rounded-md border border-zinc-200 overflow-hidden">
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
        <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700 text-center">
          לא ניתן לטעון את המוצרים: {error}
        </div>
      )}

      {/* ריק */}
      {!loading && !error && products.length === 0 && (
        <EmptyState
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          title="אין עדיין היסטוריית קניות"
          description="סרוק קבלה ראשונה ונוכל להציג את המוצרים שאתה קונה הכי הרבה."
          actionLabel="לסריקת קבלה"
          actionTo="/scan"
        />
      )}

      {/* מובייל: כרטיסים */}
      {!loading && !error && products.length > 0 && (
        <div className="md:hidden space-y-2.5">
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
        <div className="hidden md:block bg-white rounded-md border border-zinc-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-right">
                <th className="px-5 py-3 font-semibold text-zinc-500 text-xs w-12">#</th>
                <th className="px-5 py-3 font-semibold text-zinc-500 text-xs min-w-[12rem]">מוצר</th>
                <th className="px-5 py-3 font-semibold text-zinc-500 text-xs whitespace-nowrap">סופרמרקט</th>
                <th className="px-5 py-3 font-semibold text-zinc-500 text-xs text-center whitespace-nowrap">כמות</th>
                <th className="px-5 py-3 font-semibold text-zinc-500 text-xs text-left whitespace-nowrap">סה״כ הוצאה</th>
                <th className="px-3 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const inCart = inCartQty(p.productName);
                return (
                  <tr
                    key={`${p.productName}-${p.store}`}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors"
                  >
                    <td className="px-5 py-3 text-center align-middle">
                      <RankNumber rank={i + 1} />
                    </td>
                    <td className="px-5 py-3 align-middle min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-zinc-900">{p.productName}</span>
                        {inCart > 0 && <InCartBadge qty={inCart} />}
                      </div>
                    </td>
                    <td className="px-5 py-3 align-middle whitespace-nowrap">
                      <StoreChip name={p.store} />
                    </td>
                    <td className="px-5 py-3 text-center font-semibold text-zinc-900 align-middle whitespace-nowrap">
                      {p.totalQuantity}
                    </td>
                    <td className="px-5 py-3 text-left font-medium text-zinc-900 align-middle whitespace-nowrap">
                      {formatPrice(p.totalPrice)}
                    </td>
                    <td className="px-3 py-3 text-center align-middle">
                      {onAddAgain && <AddButton onClick={() => handleAddDesktop(p)} />}
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
