// components/cart/CartFooter.jsx
// ─────────────────────────────────────────────────────────
// Footer קבוע בתחתית המסך — מציג סיכום הסל.
// אם יש מוצרים ללא מחיר — מציג הערה.
// ─────────────────────────────────────────────────────────

const formatPrice = (n) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency", currency: "ILS", maximumFractionDigits: 2,
  }).format(n);

const CartFooter = ({ totalItems, totalPrice, missingPrice, selectedStore }) => (
  <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-slate-200 shadow-lg z-40" dir="rtl">
    <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

      {/* שמאל — סיכום */}
      <div className="flex items-center gap-5">
        <div className="text-center">
          <p className="text-xs text-slate-400">פריטים</p>
          <p className="font-bold text-slate-800 text-lg leading-none">{totalItems}</p>
        </div>
        <div className="w-px h-8 bg-slate-100" />
        <div className="text-center">
          <p className="text-xs text-slate-400">סה"כ לתשלום</p>
          <p className="font-bold text-emerald-600 text-lg leading-none">
            {formatPrice(totalPrice)}
          </p>
        </div>
      </div>

      {/* ימין — הערות */}
      <div className="text-left flex-1">
        {selectedStore && (
          <p className="text-xs text-slate-500">
            🏪 <span className="font-medium">{selectedStore}</span>
          </p>
        )}
        {missingPrice && (
          <p className="text-xs text-amber-500 mt-0.5">
            ⚠️ חלק מהמוצרים ללא מחיר — המחיר הסופי חלקי
          </p>
        )}
      </div>
    </div>
  </div>
);

export default CartFooter;
