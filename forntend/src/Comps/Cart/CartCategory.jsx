// components/cart/CartCategory.jsx
// ─────────────────────────────────────────────────────────
// קבוצת פריטים תחת קטגוריה אחת.
// כל פריט: שם, כמות (+/-), מחיר, כפתור מחיקה.
// ─────────────────────────────────────────────────────────

const formatPrice = (p) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency", currency: "ILS", maximumFractionDigits: 2,
  }).format(p);

/**
 * @param {{ category: string, items: Array, onIncrease, onDecrease, onRemove }} props
 */
const CartCategory = ({ category, items, onIncrease, onDecrease, onRemove }) => (
  <section className="mb-6">
    {/* כותרת קטגוריה */}
    <div className="flex items-center gap-2 mb-2 px-1">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        {category}
      </span>
      <div className="flex-1 h-px bg-slate-100" />
      <span className="text-xs text-slate-400">{items.length} פריטים</span>
    </div>

    {/* פריטים */}
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {items.map((item, idx) => (
        <div
          key={item.name}
          className={`flex items-center gap-3 px-4 py-3.5
            ${idx < items.length - 1 ? "border-b border-slate-50" : ""}
            hover:bg-slate-50 transition-colors`}
        >
          {/* שם מוצר */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-800 text-sm truncate">{item.name}</p>
            {/* מחיר */}
            {item.price > 0 ? (
              <p className="text-xs text-slate-400 mt-0.5">
                {formatPrice(item.price)} ליחידה
              </p>
            ) : (
              <p className="text-xs text-amber-500 mt-0.5">אין מחיר כרגע</p>
            )}
          </div>

          {/* כמות */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onDecrease(item)}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200
                text-slate-600 font-bold text-sm flex items-center justify-center transition"
            >
              −
            </button>
            <span className="w-6 text-center font-semibold text-slate-800 text-sm">
              {item.qty}
            </span>
            <button
              onClick={() => onIncrease(item)}
              className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200
                text-emerald-700 font-bold text-sm flex items-center justify-center transition"
            >
              +
            </button>
          </div>

          {/* סה"כ פריט */}
          <div className="w-16 text-left flex-shrink-0">
            {item.price > 0 ? (
              <span className="text-sm font-semibold text-slate-700">
                {formatPrice(item.price * item.qty)}
              </span>
            ) : (
              <span className="text-xs text-slate-300">—</span>
            )}
          </div>

          {/* מחיקה */}
          <button
            onClick={() => onRemove(item.name)}
            className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-300
              hover:text-red-400 flex items-center justify-center transition flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  </section>
);

export default CartCategory;
