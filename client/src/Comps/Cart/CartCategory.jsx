// components/cart/CartCategory.jsx
// ─────────────────────────────────────────────────────────
// קבוצת פריטים תחת קטגוריה אחת.
// כל פריט: שם (עם עריכה inline), כמות, מחיר, מחיקה.
//
// עריכת שם מוצר:
//   לחיצה על אייקון העיפרון (מופיע בhover) מעבירה את השם ל-input.
//   אישור: Enter או עזיבת הפוקוס → קריאה ל-onRename(oldName, newName).
//   ביטול: Escape → חזרה לשם המקורי ללא שמירה.
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";

const formatPrice = (p) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency", currency: "ILS", maximumFractionDigits: 2,
  }).format(p);

// ── אייקון עריכה ───────────────────────────────────────
const EditIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

// ── פריט בודד ────────────────────────────────────────────
const CartItem = ({ item, isLast, onIncrease, onDecrease, onRemove, onSetQty, onRename }) => {
  // ── state כמות ──────────────────────────────────────────
  const [val, setVal] = useState(String(item.qty));

  // ── state עריכת שם ──────────────────────────────────────
  const [editing,  setEditing]  = useState(false);
  const [editName, setEditName] = useState(item.name);
  const nameInputRef = useRef(null);

  // סנכרון כמות מבחוץ (לחיצת +/-)
  useEffect(() => { setVal(String(item.qty)); }, [item.qty]);

  // סנכרון שם מבחוץ (לאחר onRename מהשרת)
  useEffect(() => { setEditName(item.name); }, [item.name]);

  // ── אישור כמות ──────────────────────────────────────────
  const commitQty = () => {
    const n = Math.max(1, parseInt(val, 10) || 1);
    setVal(String(n));
    if (n !== item.qty) onSetQty(item, n);
  };

  // ── התחלת עריכת שם ──────────────────────────────────────
  const startEdit = () => {
    setEditing(true);
    setEditName(item.name);
    // פוקוס אוטומטי אחרי ה-render
    setTimeout(() => nameInputRef.current?.focus(), 40);
  };

  // ── אישור שם חדש ────────────────────────────────────────
  const commitName = () => {
    const newName = editName.trim();
    setEditing(false);
    if (newName && newName !== item.name) {
      onRename(item.name, newName);
    } else {
      // אין שינוי / שדה ריק — חזרה לשם הקיים
      setEditName(item.name);
    }
  };

  // ── ביטול עריכה (Escape) ─────────────────────────────────
  const cancelEdit = () => {
    setEditing(false);
    setEditName(item.name);
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5
        ${!isLast ? "border-b border-slate-50" : ""}
        hover:bg-slate-50 transition-colors group`}
    >
      {/* ── שם מוצר (תצוגה / עריכה) ─────────────────────── */}
      <div className="flex-1 min-w-0">
        {editing ? (
          /* מצב עריכה — input עם שם נוכחי */
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
            className="w-full text-sm font-medium text-slate-800
              border border-emerald-400 rounded-lg px-2 py-0.5
              focus:outline-none focus:ring-2 focus:ring-emerald-300"
            aria-label="ערוך שם מוצר"
          />
        ) : (
          /* מצב תצוגה — שם + אייקון עיפרון בhover */
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-slate-800 text-sm truncate">{item.name}</p>
            <button
              onClick={startEdit}
              /* מוסתר ברגיל, מופיע ב-hover של שורת הפריט */
              className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center
                justify-center text-slate-300 hover:text-emerald-500 transition flex-shrink-0"
              title="ערוך שם מוצר"
              aria-label={`ערוך שם ${item.name}`}
            >
              <EditIcon />
            </button>
          </div>
        )}

        {item.price > 0 ? (
          <p className="text-xs text-slate-400 mt-0.5">
            {formatPrice(item.price)} ליחידה
          </p>
        ) : (
          <p className="text-xs text-amber-500 mt-0.5">אין מחיר כרגע</p>
        )}
      </div>

      {/* ── כמות — +/- ו-input ──────────────────────────── */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onDecrease(item)}
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200
            text-slate-600 font-bold text-sm flex items-center justify-center transition"
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
          className="w-12 text-center font-semibold text-slate-800 text-sm
            border border-slate-200 rounded-lg py-1 focus:outline-none
            focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          aria-label={`כמות ${item.name}`}
        />

        <button
          onClick={() => onIncrease(item)}
          className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200
            text-emerald-700 font-bold text-sm flex items-center justify-center transition"
          aria-label="הוסף כמות"
        >
          +
        </button>
      </div>

      {/* ── סה"כ פריט ───────────────────────────────────── */}
      <div className="w-16 text-left flex-shrink-0">
        {item.price > 0 ? (
          <span className="text-sm font-semibold text-slate-700">
            {formatPrice(item.price * item.qty)}
          </span>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        )}
      </div>

      {/* ── מחיקה ───────────────────────────────────────── */}
      <button
        onClick={() => onRemove(item.name)}
        className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-300
          hover:text-red-400 flex items-center justify-center transition flex-shrink-0"
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

// ── קטגוריה ───────────────────────────────────────────────
const CartCategory = ({ category, items, onIncrease, onDecrease, onRemove, onSetQty, onRename }) => (
  <section className="mb-6">
    {/* כותרת קטגוריה */}
    <div className="flex items-center gap-2 mb-2 px-1">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        {category}
      </span>
      <div className="flex-1 h-px bg-slate-100" />
      <span className="text-xs text-slate-400">{items.length} פריטים</span>
    </div>

    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {items.map((item, idx) => (
        <CartItem
          key={item.name}
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
