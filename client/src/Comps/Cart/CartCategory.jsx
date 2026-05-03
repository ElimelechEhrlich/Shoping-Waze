// components/cart/CartCategory.jsx
// קבוצת פריטים תחת קטגוריה אחת.

import { useState, useRef } from "react";

const formatPrice = (p) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency", currency: "ILS", maximumFractionDigits: 2,
  }).format(p);

const EditIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const CartItem = ({ item, isLast, onIncrease, onDecrease, onRemove, onSetQty, onRename }) => {
  const [val, setVal] = useState(String(item.qty));
  const [editing,  setEditing]  = useState(false);
  const [editName, setEditName] = useState(item.name);
  const nameInputRef = useRef(null);

  const commitQty = () => {
    const n = Math.max(1, parseInt(val, 10) || 1);
    setVal(String(n));
    if (n !== item.qty) onSetQty(item, n);
  };

  const startEdit = () => {
    setEditing(true);
    setEditName(item.name);
    setTimeout(() => nameInputRef.current?.focus(), 40);
  };

  const commitName = () => {
    const newName = editName.trim();
    setEditing(false);
    if (newName && newName !== item.name) {
      onRename(item.name, newName);
    } else {
      setEditName(item.name);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditName(item.name);
  };

  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3
        ${!isLast ? "border-b border-zinc-100" : ""}
        hover:bg-zinc-50 transition-colors group`}
    >
      {/* ── שם מוצר (תצוגה / עריכה) ─────────────────────── */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={nameInputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter")  commitName();
              if (e.key === "Escape") cancelEdit();
            }}
            className="w-full text-sm font-medium text-zinc-900
              border border-zinc-400 rounded-sm px-2 py-1
              focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 bg-white"
            aria-label="ערוך שם מוצר"
          />
        ) : (
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-zinc-900 text-sm truncate">{item.name}</p>
            <button
              onClick={startEdit}
              className="opacity-50 hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                w-6 h-6 rounded-sm flex items-center justify-center
                text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition flex-shrink-0"
              title="ערוך שם מוצר"
              aria-label={`ערוך שם ${item.name}`}
            >
              <EditIcon />
            </button>
          </div>
        )}

        {item.price > 0 ? (
          <p className="text-xs text-zinc-500 mt-0.5">{formatPrice(item.price)} ליחידה</p>
        ) : (
          <p className="text-xs text-amber-700 mt-0.5">אין מחיר במאגר</p>
        )}
      </div>

      {/* ── כמות — +/- ו-input ──────────────────────────── */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onDecrease(item)}
          className="w-8 h-8 rounded-sm bg-zinc-100 hover:bg-zinc-200
            text-zinc-700 font-semibold text-base flex items-center justify-center
            transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          aria-label="הפחת כמות"
        >
          −
        </button>

        <input
          type="number"
          min="1"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commitQty}
          onKeyDown={(e) => e.key === "Enter" && commitQty()}
          className="w-12 text-center font-semibold text-zinc-900 text-sm
            border border-zinc-300 rounded-sm py-1.5 focus:outline-none
            focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 bg-white"
          aria-label={`כמות ${item.name}`}
        />

        <button
          onClick={() => onIncrease(item)}
          className="w-8 h-8 rounded-sm bg-zinc-900 hover:bg-zinc-800
            text-white font-semibold text-base flex items-center justify-center
            transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          aria-label="הוסף כמות"
        >
          +
        </button>
      </div>

      {/* ── סה"כ פריט ───────────────────────────────────── */}
      <div className="w-14 sm:w-16 text-left flex-shrink-0 tabular-nums">
        {item.price > 0 ? (
          <span className="text-sm font-semibold text-zinc-900">
            {formatPrice(item.price * item.qty)}
          </span>
        ) : (
          <span className="text-xs text-zinc-400">—</span>
        )}
      </div>

      {/* ── מחיקה ───────────────────────────────────────── */}
      <button
        onClick={() => onRemove(item.name)}
        className="w-9 h-9 sm:w-8 sm:h-8 rounded-sm text-zinc-400
          hover:bg-red-50 hover:text-red-700 flex items-center justify-center
          transition flex-shrink-0 touch-manipulation
          focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        aria-label={`הסר ${item.name}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

const CartCategory = ({ category, items, onIncrease, onDecrease, onRemove, onSetQty, onRename }) => (
  <section className="mb-5">
    <div className="flex items-center gap-2 mb-2 px-1">
      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
        {category}
      </span>
      <div className="flex-1 h-px bg-zinc-200" />
      <span className="text-[11px] text-zinc-500">{items.length} פריטים</span>
    </div>

    <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
      {items.map((item, idx) => (
        <CartItem
          key={`${item.name}-${item.qty}`}
          item={item}
          isLast={idx === items.length - 1}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
          onRemove={onRemove}
          onSetQty={onSetQty}
          onRename={onRename}
        />
      ))}
    </div>
  </section>
);

export default CartCategory;
