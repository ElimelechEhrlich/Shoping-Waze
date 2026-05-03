// components/cart/CartFooter.jsx
// Sticky bottom summary footer for the cart page.

const formatPrice = (n) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency", currency: "ILS", maximumFractionDigits: 2,
  }).format(n);

const CartFooter = ({ totalItems, totalPrice, missingPrice }) => (
  <div className="fixed bottom-0 right-0 left-0 bg-white/95 backdrop-blur border-t border-zinc-200 z-40" dir="rtl">
    <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

      {/* סיכום */}
      <div className="flex items-center gap-5">
        <div>
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider">פריטים</p>
          <p className="font-bold text-zinc-900 text-base leading-tight">{totalItems}</p>
        </div>
        <div className="w-px h-8 bg-zinc-200" />
        <div>
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider">סה"כ</p>
          <p className="font-bold text-zinc-900 text-base leading-tight">
            {formatPrice(totalPrice)}
          </p>
        </div>
      </div>

      {/* הערות */}
      <div className="text-left flex-1 min-w-0">
        {missingPrice && (
          <p className="text-[11px] text-amber-700 inline-flex items-center gap-1 truncate">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="truncate">חלק מהמוצרים ללא מחיר</span>
          </p>
        )}
      </div>
    </div>
  </div>
);

export default CartFooter;
