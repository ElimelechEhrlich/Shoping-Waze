// components/cart/NoPriceModal.jsx
// ─────────────────────────────────────────────────────────
// Popup שמופיע כשמנסים להוסיף כמות למוצר ללא מחיר.
// מאפשר: לאשר בלי מחיר, להכניס מחיר ואז לאשר, או לבטל.
// ─────────────────────────────────────────────────────────

import { useState } from "react";

const NoPriceModal = ({ item, onConfirm, onCancel }) => {
  const [price, setPrice] = useState("");

  const handleConfirm = () => {
    const parsed = parseFloat(price);
    // אם הכניס מחיר תקין — שולחים אותו, אחרת 0
    onConfirm(parsed > 0 ? parsed : 0);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" dir="rtl">
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">🏷️</div>
          <h3 className="font-bold text-slate-800 text-lg">מחיר לא ידוע</h3>
          <p className="text-slate-500 text-sm mt-1">
            למוצר <span className="font-semibold text-slate-700">{item.name}</span> אין מחיר כרגע
          </p>
        </div>

        {/* שדה הכנסת מחיר */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            הכנס מחיר (אופציונלי)
          </label>
          <div className="relative">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₪</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full pr-8 pl-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600
              text-sm font-medium hover:bg-slate-50 transition"
          >
            ביטול
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600
              text-white text-sm font-semibold transition"
          >
            {price > 0 ? "הוסף עם מחיר" : "הוסף בלי מחיר"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoPriceModal;
